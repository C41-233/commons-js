(function(global){

function global_fallback(){
	throw new Error("overload function not found!")
}

function global_bind_nothing(func){
	for(var key in global.overload){
		var name = "$$" + key + "$"
		if(global[name] === undefined){
			global[name] = func(key)
		}
	}
}

function make_assert(define){
	var argc = define.length - 1
	var iss = []
	for(var i=0; i<argc; i++){
		iss.push(make_assert_one(define[i]))
	}
	
	var has_var_arg = define.length > 0 && !!(define[argc-1].is_overload_var_arg)
	if(has_var_arg){
		return {
			action: (_this, args) => {
				var realArgs = []
				for(var i = 0; i < argc-1; i++){
					realArgs.push(args[i])
				}
				var varargs = []
				for(var i = argc-1; i < args.length; i++){
					varargs.push(args[i])
				}
				realArgs.push(varargs)
				return define[argc].apply(_this, realArgs)
			},
			is: args => {
				if(args.length < argc-1){
					return false
				}
				for(var i=0; i<argc-1; i++){
					if(!iss[i](args[i])){
						return false
					}
				}
				if(args.length == argc-1){
					return true
				}
				return iss[argc-1](args, argc-1)
			}
		}
	}
	else{
		return {
			action: (_this, args) => {
				return define[argc].apply(_this, args)
			},
			is: args => {
				if(args.length !== argc){
					return false
				}
				for(var i=0; i<argc; i++){
					if(!iss[i](args[i])){
						return false
					}
				}
				return true
			}
		}
	}
}

function make_assert_one(obj){
	if(obj.is_overload_var_arg){
		return obj
	}
	else{
		return v => (obj.prototype !== undefined && v instanceof obj) || obj(v)
	}
}

global.overload = function(defines){
	var fallback = global_fallback
	var len = defines.length
	
	if(len > 0){
		var last_object = defines[len - 1]
		if(typeof(last_object) === "function"){
			fallback = last_object
			len = len - 1
		}
	}
	
	var asserts = []
	for(var i = 0; i < len; i++){
		var define = defines[i]
		asserts.push(make_assert(define))
	}
	
	return function(){
		for(var i=0; i<asserts.length; i++){
			var assert = asserts[i]
			if(assert.is(arguments)){
				return assert.action(this, arguments)
			}
		}
		return fallback.apply(this, arguments)
	}
}

global.overload.string = v => typeof(v) === "string"
global.overload.number = v => typeof(v) === "number"
global.overload.object = v => typeof(v) === "object"
global.overload.function = v => typeof(v) === "function"
global.overload.array = v => v instanceof Array

global_bind_nothing(key => v => v === undefined || v === null || global.overload[key](v))

global.overload.instanceof = function(t){
	return v => v instanceof t
}

global.overload.arrayof = function(e){
	var element_assert = make_assert_one(e)
	return v => {
		if(v instanceof Array){
			for(var i=0; i<v.length; i++){
				if(!element_assert(v[i])){
					return false
				}
			}
			return true
		}
		return false
	}
}

global_bind_nothing(key => e => {
	var action = global.overload[key](e)
	return v => v === undefined || v === null || action(v)
})

global.overload.null = v => v === null
global.overload.undefined = v => v === undefined
global.overload.nothing = v => v === null || v === undefined
global.overload.any = v => true

global.overload.varargs = (args, from) => true
global.overload.varargs.is_overload_var_arg = true

global.overload.varargsof = function(e){
	var element_assert = make_assert_one(e)
	var rst = (args, from) => {
		for(var i=from; i<args.length; i++){
			if(!element_assert(args[i])){
				return false
			}
		}
		return true
	}
	rst.is_overload_var_arg = true
	return rst
}

for(var key in global.overload){
	global["$$"+key] = global.overload[key]
}

})(typeof window !== "undefined" ? window : this);
