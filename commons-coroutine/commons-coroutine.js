(function(global){

"use strict";

function Coroutine(coroutine){
	let self = this
	let stopped = false
	
	let pinned_promise
	
	let promise = new Promise(function(success, fail){
		self.stop = stop
		dispatch()
		
		function stop(rst){
			if(stopped){
				return
			}
			stopped = true
			if(pinned_promise instanceof Coroutine){
				pinned_promise.stop(rst)
			}
			fail(rst)
		}
		
		function dispatch(value){
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
		
		function next(promise){
			//must function*
			if(typeof(promise) === "function"){
				promise = co(promise)
			}
			pinned_promise = promise
			promise.then(
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
	milliseconds: function(time){
		return new Promise(function(success, error){
			global.setTimeout(
				() => success(), 
				time
			)
		})
	},
	seconds: function(time){
		return this.milliseconds(1000 * time)
	}
}
co.wait.ms = co.wait.milliseconds
co.wait.s = co.wait.seconds

})(typeof window !== "undefined" ? window : this);
