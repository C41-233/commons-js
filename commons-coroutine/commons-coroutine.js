(function(global, undefined){

"use strict";

let abort = Symbol("stop")

function Coroutine(coroutine){
	let self = this
	let stopped = false
	
	let current_promise = undefined
	
	let promise = new Promise(function(success, fail){
		self[abort] = stop
		dispatch()
		
		function stop(rst){
			if(stopped){
				return
			}
			stopped = true
			if(current_promise !== undefined && typeof(current_promise[abort]) === "function"){
				current_promise[abort](rst)
			}
			fail(rst)
		}
		
		function dispatch(value){
			current_promise = undefined
			if(stopped){
				return
			}
			try{
				let current = coroutine.next(value)
				handle(current)
			} catch(e){
				stop(e)
			}
		}

		function handle(current){
			if(stopped){
				return
			}
			if(current.done){
				stopped = true
				success(current.value)
				return
			}
			next(current.value)
		}

		function error(rst){
			current_promise = undefined
			if(stopped){
				return
			}
			try{
				let current = coroutine.throw(rst)
				handle(current)	
			}
			catch(e){
				stop(e)
			}
		}
		
		function next(value){
			//must function*
			if(typeof(value) === "function"){
				value = co(value)
			}
			//yield one frame
			else if(typeof(value) === "undefined"){
				value = new Promise(s => global.setTimeout(s, 0))
			}
			
			//or promise
			current_promise = value
			value.then(
				rst => dispatch(rst), 
				rst => error(rst)
			)
		}
		
	})
	
	Object.defineProperty(self, "done", {
		get: function(){
			return stopped
		},
		configurable: false
	})
	
	self.then = (...args) => Promise.prototype.then.apply(promise, args)
	self.catch = (...args) => Promise.prototype.catch.apply(promise, args)
	self.stop = function(rst){
		return this[abort](rst)
	}
}

let co = function(coroutine){
	//must function*
	if(typeof(coroutine) === "function"){
		coroutine = coroutine()
	}
	return new Coroutine(coroutine)
}

global.co = co

co.wait = {
	milliseconds: time => new Promise(success => global.setTimeout(success, time)),
	seconds: function(time){
		return this.milliseconds(1000 * time)
	}
}

co.symbol = {
	stop: abort
}

co.wait.ms = co.wait.milliseconds
co.wait.s = co.wait.seconds

co.event = (element, name) => {
	if(global.jQuery && element instanceof global.jQuery){
		return new Promise(success => element.one(name, success))
	}
	
	if(global.document && typeof(global.document.getElementById) === "function" && typeof(element) === "string"){
		element = global.document.getElementById(element)
	}
	return new Promise(
		success => { 
			let cb = function(){
				element.removeEventListener(name, cb)
				success()
			}
			element.addEventListener(name, cb)
		}
	)
}

})(
	typeof(window) !== "undefined" && typeof window.body === "object" ? window : this, 
	undefined
);
