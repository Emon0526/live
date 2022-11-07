// 服务器判断
var baseUrl = 'http://api.hclyz.com:81/mf/'

// 获取url参数
function getUrlParam(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)') //构造一个含有目标参数的正则表达式对象
	var search = decodeURI(window.location.search)
	var r = search.substr(1).match(reg) //匹配目标参数
	if (r != null) return unescape(r[2])
	return null //返回参数值
}

function setStorageItem(name, value, expires = undefined) {
	const obj = {
		name: name,
		value: value,
		startTime: new Date().getTime(), // 记录何时将值存入缓存，毫秒级
	}
	if (expires) {
		obj.expires = expires
	}
	if (obj.expires) {
		// obj.expires设置了的话
		// obj.name为key，options为值放进去
		localStorage.setItem(obj.name, JSON.stringify(obj))
	} else {
		// obj.expires没有设置，就判断一下value的类型
		const type = Object.prototype.toString.call(obj.value)
		// 如果value是对象或者数组对象的类型，就先用JSON.stringify转一下，再存进去
		if (type === '[object Object]') {
			obj.value = JSON.stringify(obj.value)
		}
		if (type === '[object Array]') {
			obj.value = JSON.stringify(obj.value)
		}
		localStorage.setItem(obj.name, obj.value)
	}
}

// 拿到缓存
function getStorageItem(name) {
	let item = localStorage.getItem(name)
	// 先将拿到的试着进行json转为对象的形式
	if (!item) {
		return false
	}

	try {
		item = JSON.parse(item)
	} catch (error) {
		const data = item
		item = data
	}

	// 如果有startTime的值，说明设置了失效时间
	if (item.expires) {
		const date = new Date().getTime()
		// 何时将值取出减去刚存入的时间，与item.expires比较，如果大于就是过期了，如果小于或等于就还没过期

		if (date - item.startTime > item.expires) {
			// 缓存过期，清除缓存，返回false

			localStorage.removeItem(name)
			return false
		} else {
			// 缓存未过期，返回值
			return item.value
		}
	} else {
		// 如果没有设置失效时间，直接返回值
		return item
	}
}
// 移出缓存
function removeStorageItem(name) {
	localStorage.removeItem(name)
}
// 移出全部缓存
function clearStorage() {
	localStorage.clear()
}

axios.defaults.baseURL = baseUrl
if (getStorageItem('accessToken')) {
	axios.defaults.headers.common['token'] = getStorageItem('accessToken')
}

axios.interceptors.response.use(
	function (response) {
		// 2xx 范围内的状态码都会触发该函数。
		// 对响应数据做点什么
		return response
	},
	function (error) {
		if (error.response.status == 0) {
			weui.topTips('服务器连接失败')
		}
		if (error.response.status == 401) {
			refreshToken()
		}
		if (error.response.status == 500) {
			weui.topTips(error.response.status + ' ' + error.response.statusText)
		}

		return Promise.reject(error)
	}
)
const request = axios.create({
	timeout: 5000,
	headers: {
		refreshToken: getStorageItem('refreshToken'),
	},
})
// 刷新缓存
function refreshToken() {
	request
		.post('/api/v1/auth/token/refresh')
		.then((res) => {
			setStorageItem('refreshToken', res.data.refreshToken)
			setStorageItem('accessToken', res.data.accessToken, res.data.expireIn)
		})
		.catch((err) => {
			if (err.response.status == 401) {
				layer.msg('登录已失效，请重新登录')
				window.location.href = '/login.html'
			}
		})
}

function getUserInfo() {
	axios
		.post('/api/v1/auth/user-info')
		.then((res) => {
			setStorageItem('userInfo', res.data)
		})
		.catch((err) => {
			layer.msg(err.response.data.errorMsg)
		})
}

// 引入重置css文件
function addiconfontCSS() {
	var resetcss = document.createElement('link')
	if (resetcss.parentNode !== document.head) {
		resetcss.rel = 'stylesheet'
		resetcss.type = 'text/css'
		resetcss.href = '//at.alicdn.com/t/c/font_3581278_lyxupxtz1da.css'
		document.head.appendChild(resetcss)
	}
}

// 添加vConsole调试
function addConsoleLog() {
	var consolemin = document.createElement('script')
	if (consolemin.parentNode !== document.head) {
		consolemin.type = 'text/javascript'
		consolemin.src = 'https://cdn.staticfile.org/eruda/2.3.3/eruda.min.js'
		// consolemin.async = true;
		document.head.appendChild(consolemin)
		consolemin.onload = function () {
			var t = document.createElement('script')
			t.type = 'text/javascript'
			t.text = 'eruda.init();'
			document.head.appendChild(t)
		}
	}
}
addiconfontCSS()
