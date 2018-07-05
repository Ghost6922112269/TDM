'use strict'

const https = require('https')
const fs = require('fs')
const path = require('path')

let version = ''

String.prototype.clr = function (hexColor) { return `<font color='#${hexColor}'>${this}</font>` }

function Update(v) {
	version = v

	this.download = function (url, dest, cb) {
		var file = fs.createWriteStream(dest)
		var request = https.get(url, function(response) {
			response.pipe(file)
		}).on('error', function(err) { // Handle errors
			fs.unlink(dest) // Delete the file async. (But we don't check the result)
			if (err) throw err
		})

		file.on('finish', function() {
			file.close(cb)
		})

		file.on('error', function (err) {
			fs.unlink(dest)
			console.log(err)
		})
	}

	function downloadRename(url, downloaded, dest, cb) {
		var file = fs.createWriteStream(downloaded)
		var request = https.get(url, function(response) {
			response.pipe(file)
		}).on('error', function(err) {
			fs.unlink(downloaded)
			if (err) throw err
		})
		file.on('finish', function() {
			file.close(cb)
			fs.rename(downloaded, dest, function (err) {
				console.log('OverWriteFiles :'+  downloaded + ' '+ dest)
				if (err) throw err
			})
		})

		file.on('error', function (err) {
			fs.unlink(downloaded)
			console.log(err)
		})
	}

	this.checkUpdate = function()
	{
		var dest,url
		var rootUrl = `https://raw.githubusercontent.com/xmljson/TDM/master/`
		// check manifest
		var gitkey = 'manifest.json'
		dest = path.join(__dirname,'_' + gitkey)
		url = rootUrl + gitkey
		this.download(url,dest,getVersionCB)
	}

	function getVersionCB()
	{
		var gitManifest = require('./_manifest.json')
		var currentManifest = require('./manifest.json')
		var gitkey = 'manifest.json'
		var dest = path.join(__dirname,'_' + gitkey)
		//fs.unlink(dest)
		version = 'TDM version ' + currentManifest.version
		//console.log(Date.now() + ' ' + currentManifest.version + ' ' + gitManifest.version )
		if(currentManifest.version === gitManifest.version) return
		version = `Please update new ${gitManifest.version} version.`.clr('FF0000') + '<button class=btn onclick="Update()">Update</button>'

	}

	this.update = function ()
	{
		var dest,url
		var rootUrl = `https://raw.githubusercontent.com/xmljson/TDM/master/`
		// check manifest
		var gitkey = 'manifest.json'
		dest = path.join(__dirname,'_' + gitkey)
		url = rootUrl + gitkey

		if (!fs.existsSync(path.join(__dirname,'router'))) fs.mkdirSync(path.join(__dirname,'router'))

		this.download(url,dest,checkVersionCB)
	}

	function checkVersionCB()
	{
		var gitManifest = require('./_manifest.json')
		var currentManifest = require('./manifest.json')
		var gitkey = 'manifest.json'
		var dest = path.join(__dirname,'_' + gitkey)
		//fs.unlink(dest)
		version = 'TDM version ' + currentManifest.version
		//console.log(currentManifest.version + ' ' + gitManifest.version)
		if(currentManifest.version === gitManifest.version) return
		version = `Downloading new ${gitManifest.version} version.`.clr('FF0000')
		updateFiles()
	}

	function updateFiles()
	{
		var dest,url
		var rootUrl = 'https://raw.githubusercontent.com/xmljson/TDM/master/'
		//var result= ''

		var _manifest = require('./_manifest.json')

		for(var key in _manifest.files)
		{
			if(key === 'config.json') continue
			dest = path.join(__dirname,key)
			url = rootUrl + key
			//result += `Downloading ${key}<br>`
			downloadRename(url,dest+'.downloaded',dest,null)
		}

		var tmpkey = 'manifest.json'
		dest = path.join(__dirname,tmpkey)
		url = rootUrl + tmpkey
		downloadRename(url,dest+'.downloaded',dest,null)

		console.log('TDM has been Updated. restart proxy.')
		//result += 'TDM has been Updated. restart tera proxy'
		version = `TDM has been Updated. restart tera proxy.`.clr('FF0000')
		//return result
	}

	this.getVersion = function ()
	{
		//console.log(version)
		return version
	}

}


module.exports = Update
