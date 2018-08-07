(function(global){

/*
 * global fallback handler
 * just throw exception
 */
function global_fallback(){
	var msg = "overload function not found, args=["
	for(var i = 0; i < arguments.length; i++){
		var arg = arguments[i]
		msg += arg
		if(i != arguments.length - 1){
			msg += ", "
		}
	}
	msg += "]"
	throw new Error(msg)
}

/* core function */

function make_assert(define){
	var argc = define.length - 1
	var iss = []
	for(var i=0; i<argc; i++){
		iss.push(make_assert_one(define[i]))
	}
	
	var has_var_arg = define.length > 0 && (define[argc-1] instanceof overload_var_arg)
	if(has_var_arg){
		return {
			action: (_this, args) => define[argc].apply(_this, args),
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
				return iss[argc-1].match(args, argc-1)
			}
		}
	}
	else{
		return {
			action: (_this, args) => define[argc].apply(_this, args),
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
	if(obj instanceof overload_var_arg){
		return obj
	}
	else if(typeof(obj) === "function"){
		if(obj.prototype === undefined){
			return obj
		}
		else{
			return v => v instanceof obj
		}
	}
	else{
		throw new Error("Unknown descriptor of " + obj)
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

function bind(name, func){
	global.overload[name] = func
	global["$" + name] = func
}

/* varargs bind */

function overload_var_arg(match){
	this.match = match
}

bind("varargs", new overload_var_arg((args, from) => true))

bind("varargsof", e => {
	var element_assert = make_assert_one(e)
	var rst = (args, from) => {
		for(var i=from; i<args.length; i++){
			if(!element_assert(args[i])){
				return false
			}
		}
		return true
	}
	return new overload_var_arg(rst)
})

/* custom bind */

bind("string", v => typeof(v) === "string")
bind("number", v => typeof(v) === "number")
bind("object", v => typeof(v) === "object")
bind("function", v => typeof(v) === "function")
bind("array", v => v !== undefined && typeof(v.length) === "number" && v.length >= 0)

bind("instanceof", t => v => v instanceof t)
bind("propertyof", (...arguments) => {
	var properties = arguments
	return v => {
		for(var i = 0; i < properties.length; i++){
			var property = properties[i]
			if(typeof(v[property]) === "undefined"){
				return false
			}
		}
		return true
	}
})
bind("arrayof", e => {
	var element_assert = make_assert_one(e)
	return v => {
		if(global.overload.array(v)){
			for(var i=0; i<v.length; i++){
				if(!element_assert(v[i])){
					return false
				}
			}
			return true
		}
		return false
	}
})

bind("null", v => v === null)
bind("undefined", v => v === undefined)
bind("nothing", v => v === null || v === undefined)
bind("any", v => true)

bind("nullor", e => {
	var element_assert = make_assert_one(e)
	return v => v === null || element_assert(v)
})

bind("undefinedor", e => {
	var element_assert = make_assert_one(e)
	return v => v === undefined || element_assert(v)
})

bind("nothingor", e => {
	var element_assert = make_assert_one(e)
	return v => v === undefined || v === null || element_assert(v)
})

})(typeof window !== "undefined" ? window : this);
