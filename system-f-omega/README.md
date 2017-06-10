# System Fω implementation
A JS implementation of System Fω.

## Usage
``` shell
git clone https://github.com/susisu/js-sandbox.git # or download
cd js-sandbox/system-f-omega
npm install
npm start
```

## Syntax
```
-- kind
K ::= "*"
    | K "=>" K
    | "(" K ")"

-- type
X ::= A | ... | Z | AA | ...
T ::= X
    | T "->" T
    | "forall" X "::" K "." T
    | "fun" X "::" K "." T
    | T T
    | "(" T ")"

-- term
x ::= a | ... | z | aA | ...
t ::= x
    | "fun" x ":" T "." t
    | t t
    | "fun" X "::" K "." t
    | t "[" T "]"
    | "(" t ")"

-- statement
S ::= "assume" X "::" K ";"
    | "assume" x ":" T ";"
    | "define" X ["::" K] "=" T ";"
    | "define" x [":" T] "=" t ";"
```

## Examples
```
(* pair / conjunction *)
define Pair :: * => * => *
= fun A :: *.
  fun B :: *.
  forall C :: *.
  (A -> B -> C) -> C;
define pair : forall A :: *. forall B :: *. A -> B -> Pair A B
= fun A :: *.
  fun B :: *.
  fun a : A.
  fun b : B.
  fun C :: *.
  fun c : A -> B -> C.
  c a b;
define fst : forall A :: *. forall B :: *. Pair A B -> A
= fun A :: *.
  fun B :: *.
  fun p : Pair A B.
  p [A] (
    fun a : A.
    fun b : B.
    a
  );
define snd : forall A :: *. forall B :: *. Pair A B -> B
= fun A :: *.
  fun B :: *.
  fun p : Pair A B.
  p [B] (
    fun a : A.
    fun b : B.
    b
  );

(* either / disjunction *)
define Either :: * => * => *
= fun A :: *.
  fun B :: *.
  forall C :: *.
  (A -> C) -> (B -> C) -> C;
define left : forall A :: *. forall B :: *. A -> Either A B
= fun A :: *.
  fun B :: *.
  fun a : A.
  fun C :: *.
  fun l : A -> C.
  fun r : B -> C.
  l a;
define right : forall A :: *. forall B :: *. B -> Either A B
= fun A :: *.
  fun B :: *.
  fun b : B.
  fun C :: *.
  fun l : A -> C.
  fun r : B -> C.
  r b;
define case : forall A :: *. forall B :: *. forall C :: *. Either A B -> (A -> C) -> (B -> C) -> C
= fun A :: *.
  fun B :: *.
  fun C :: *.
  fun e : Either A B.
  fun l : A -> C.
  fun r : B -> C.
  e [C] l r;

(* void / false, bottom *)
assume Void :: *;
assume absurd : forall X :: *. Void -> X;
define Not :: * => *
= fun A :: *.
  A -> Void;

(* proof of De Morgan's law *)
define deMorgan : forall A :: *. forall B :: *. Not (Either A B) -> Pair (Not A) (Not B)
= fun A :: *.
  fun B :: *.
  fun h : Not (Either A B).
  pair [Not A] [Not B] (
    fun a : A.
    h (left [A] [B] a)
  ) (
    fun b : B.
    h (right [A] [B] b)
  );
```
