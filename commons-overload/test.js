QUnit.test("overload1", function(assert) {
	var show = overload([
		[$string, s => "string"],
		[$number, s => "number"],
	])
	
	assert.strictEqual(show("123"), "string")
	assert.strictEqual(show(123), "number")
});

QUnit.test("this", function(assert) {
	function Person(){
		this.age = 0
		this.setAge = overload([
			[$number, function(n){
				this.age = n
			}],
			[$string, function(s){
				this.setAge(parseInt(s))
			}],
			[$function, function(f){
				this.setAge(f())
			}]
		])
	}
	
	var p = new Person()
	assert.strictEqual(p.age, 0)
	
	p.setAge(10)
	assert.strictEqual(p.age, 10)
	
	p.setAge("20")
	assert.strictEqual(p.age, 20)
	
	p.setAge(() => 30)
	assert.strictEqual(p.age, 30)
	
	p.setAge(() => "40")
	assert.strictEqual(p.age, 40)
});

QUnit.test("varargs", function(assert) {
	var show = overload([
		[$string, $varargs, function(s, ...args){
			return s + args.length + args[0]
		}],
		[$number, $number, $varargs, function(n1, n2, ...ns){
			return n1 + n2 + ns.length + ns[1]
		}],
		function(){
			return arguments.length
		}
	])
	
	assert.strictEqual(show("123", "123"), "1231123")
	assert.strictEqual(show(1, 2, 3, 4), 1 + 2 + 2 + 4)
});

QUnit.test("propertyof", function(assert){
	var show = overload([
		[$propertyof("title", "name"), () => "match1"],
		[$propertyof("title"), () => "match2"]
	])
	assert.strictEqual(show({title: "title", name: "name"}), "match1")
	assert.strictEqual(show({title: "title"}), "match2")
})

QUnit.test("instanceof", function(assert){
	function MyObj1(){}
	function MyObj2(){}
	function MyObj3(){}
	function MyObj4(){}
	
	var show = overload([
		[$instanceof(MyObj1), () => "MyObj1"],
		[$instanceof(MyObj2), () => "MyObj2"],
		[MyObj3, () => "MyObj3"],
		[MyObj4, () => "MyObj4"]
	])
	assert.strictEqual(show(new MyObj1()), "MyObj1")
	assert.strictEqual(show(new MyObj2()), "MyObj2")
	assert.strictEqual(show(new MyObj3()), "MyObj3")
	assert.strictEqual(show(new MyObj4()), "MyObj4")
})