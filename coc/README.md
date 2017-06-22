# Calculus of Constructions
A naive implementation of the calculus of constructions.

## Usage
``` shell
git clone https://github.com/susisu/js-sandbox.git # or somehow download
cd coc
npm install
npm start
```

## Example
```
(* the universe *)
assume U : *;

(* elements of the universe *)
assume zero    : U;
assume succ    : U -> U;
assume unknown : U;

(* predicate that a given element is a natural number *)
assume is_nat : U -> *;

(* axiom for natural numbers *)
assume zero_is_nat     : is_nat zero;
assume succ_nat_is_nat : forall x : U. is_nat x -> is_nat (succ x);

(* function on the universe (not limited to the natural numbers) *)
define plus_two : U -> U
= fun x : U. succ (succ x);

(* proof of the fact that `plus_two x` returns a natural number if so `x` is *)
define nat_plus_two_is_nat: forall x : U. is_nat x -> is_nat (plus_two x)
= fun x : U.
  fun H : is_nat x.
  succ_nat_is_nat (succ x) (
    succ_nat_is_nat x H
  );

(* instance of the general proof *)
define zero_plus_two_is_nat : is_nat (plus_two zero)
= nat_plus_two_is_nat zero zero_is_nat;
```
