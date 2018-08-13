(function(global){

let co = function(coroutine){
	if(typeof(coroutine) === "function"){
		coroutine = coroutine()
	}
	dispatch(coroutine)
}

function dispatch(coroutine, value){
	let current = coroutine.next(value)
	handle(coroutine, current)
}

function handle(coroutine, current){
	if(current.done){
		return
	}
	next(coroutine, current.value)
}

function next(coroutine, task){
	task(
		rst => dispatch(coroutine, rst),
		rst => handle(coroutine, coroutine.throw(rst))
	)
}

global.co = co

co.wait = {
	milliseconds: time => {
		return function(success, error){
			global.setTimeout(
				() => success(), 
				time
			)
		}
	}
}
co.wait.ms = co.wait.milliseconds

})(typeof window !== "undefined" ? window : this);
