// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax --harmony-bigint --no-opt

'use strict'

const zero = BigInt(0);
const another_zero = BigInt(0);
const one = BigInt(1);
const another_one = BigInt(1);
const two = BigInt(2);
const three = BigInt(3);
const six = BigInt(6);

// BigInt
{
  assertSame(BigInt, BigInt.prototype.constructor)
}

// typeof
{
  assertEquals(typeof zero, "bigint");
  assertEquals(typeof one, "bigint");
}
{
  // TODO(neis): Enable once --no-opt can be removed.
  //
  // function Typeof(x) { return typeof x }
  // assertEquals(Typeof(zero), "bigint");
  // assertEquals(Typeof(zero), "bigint");
  // %OptimizeFunctionOnNextCall(Typeof);
  // assertEquals(Typeof(zero), "bigint");
}

// ToString
{
  assertEquals(String(zero), "0");
  assertEquals(String(one), "1");
}

// .toString(radix)
{
  // assertEquals(expected, BigInt(input).toString(n)) is generated by:
  // input = $(python -c "print(int('expected', n))")
  assertEquals("hello", BigInt(18306744).toString(32));
  assertEquals("-hello", BigInt(-18306744).toString(32));
  assertEquals("abcde", BigInt(0xabcde).toString(16));
  assertEquals("-abcde", BigInt(-0xabcde).toString(16));
  assertEquals("1234567", BigInt(342391).toString(8));
  assertEquals("-1234567", BigInt(-342391).toString(8));
  assertEquals("1230123", BigInt(6939).toString(4));
  assertEquals("-1230123", BigInt(-6939).toString(4));
  assertEquals("1011001110001", BigInt(5745).toString(2));
  assertEquals("-1011001110001", BigInt(-5745).toString(2));
}

// .parseInt
{
  assertEquals("hellobigint", BigInt.parseInt("hellobigint", 32).toString(32));
  assertEquals("abc", BigInt.parseInt("101010111100", 2).toString(16));
  // Detect "0x" prefix.
  assertEquals("f00dcafe", BigInt.parseInt("0xf00dcafe").toString(16));
  // Default base is 10, trailing junk is skipped.
  assertEquals("abc", BigInt.parseInt("2748junk").toString(16));
  // Objects are converted to string.
  let obj = {toString: () => "0x12345"};
  assertEquals("12345", BigInt.parseInt(obj).toString(16));
  // Empty and invalid strings throw.
  assertThrows("BigInt.parseInt('')", SyntaxError);
  assertThrows("BigInt.parseInt('nope', 2)", SyntaxError);
}

// .valueOf
{
  assertEquals(Object(zero).valueOf(), another_zero);
  assertThrows(() => { return BigInt.prototype.valueOf.call("string"); },
               TypeError);
  // TODO(jkummerow): Add tests for (new BigInt(...)).valueOf() when we
  // can construct BigInt wrappers.
}

// ToBoolean
{
  assertTrue(!zero);
  assertFalse(!!zero);
  assertTrue(!!!zero);

  assertFalse(!one);
  assertTrue(!!one);
  assertFalse(!!!one);
}

// Strict equality
{
  assertTrue(zero === zero);
  assertFalse(zero !== zero);

  assertTrue(zero === another_zero);
  assertFalse(zero !== another_zero);

  assertFalse(zero === one);
  assertTrue(zero !== one);
  assertTrue(one !== zero);
  assertFalse(one === zero);

  assertFalse(zero === 0);
  assertTrue(zero !== 0);
  assertFalse(0 === zero);
  assertTrue(0 !== zero);
}

// SameValue
{
  const obj = Object.defineProperty({}, 'foo',
      {value: zero, writable: false, configurable: false});

  assertTrue(Reflect.defineProperty(obj, 'foo', {value: zero}));
  assertTrue(Reflect.defineProperty(obj, 'foo', {value: another_zero}));
  assertFalse(Reflect.defineProperty(obj, 'foo', {value: one}));
}

// SameValueZero
{
  assertTrue([zero].includes(zero));
  assertTrue([zero].includes(another_zero));

  assertFalse([zero].includes(+0));
  assertFalse([zero].includes(-0));

  assertFalse([+0].includes(zero));
  assertFalse([-0].includes(zero));

  assertTrue([one].includes(one));
  assertTrue([one].includes(another_one));

  assertFalse([one].includes(1));
  assertFalse([1].includes(one));
}{
  assertTrue(new Set([zero]).has(zero));
  assertTrue(new Set([zero]).has(another_zero));

  assertFalse(new Set([zero]).has(+0));
  assertFalse(new Set([zero]).has(-0));

  assertFalse(new Set([+0]).has(zero));
  assertFalse(new Set([-0]).has(zero));

  assertTrue(new Set([one]).has(one));
  assertTrue(new Set([one]).has(another_one));
}{
  assertTrue(new Map([[zero, 42]]).has(zero));
  assertTrue(new Map([[zero, 42]]).has(another_zero));

  assertFalse(new Map([[zero, 42]]).has(+0));
  assertFalse(new Map([[zero, 42]]).has(-0));

  assertFalse(new Map([[+0, 42]]).has(zero));
  assertFalse(new Map([[-0, 42]]).has(zero));

  assertTrue(new Map([[one, 42]]).has(one));
  assertTrue(new Map([[one, 42]]).has(another_one));
}

// Binary ops.
{
  assertTrue(one + two === three);
  assertEquals("hello1", "hello" + one);
  assertEquals("2hello", two + "hello");
  assertThrows("one + 2", TypeError);
  assertThrows("2 + one", TypeError);
  assertThrows("one + 0.5", TypeError);
  assertThrows("0.5 + one", TypeError);
  assertThrows("one + null", TypeError);
  assertThrows("null + one", TypeError);

  assertTrue(three - two === one);
  assertThrows("two - 1", TypeError);
  assertThrows("2 - one", TypeError);
  assertThrows("two - 0.5", TypeError);
  assertThrows("2.5 - one", TypeError);

  assertTrue(two * three === six);
  assertThrows("two * 1", TypeError);
  assertThrows("1 * two", TypeError);
  assertThrows("two * 1.5", TypeError);
  assertThrows("1.5 * two", TypeError);

  assertTrue(six / three === two);
  assertThrows("six / 3", TypeError);
  assertThrows("3 / three", TypeError);
  assertThrows("six / 0.5", TypeError);
  assertThrows("0.5 / six", TypeError);
  assertThrows("zero / zero", RangeError);
  assertThrows("zero / 0", TypeError);

  assertTrue(three % two === one);
  assertThrows("three % 2", TypeError);
  assertThrows("3 % two", TypeError);
  assertThrows("three % 2.5", TypeError);
  assertThrows("3.5 % two", TypeError);
  assertThrows("three % zero", RangeError);
  assertThrows("three % 0", TypeError);
}
