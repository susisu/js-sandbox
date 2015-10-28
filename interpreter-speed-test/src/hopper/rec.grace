method loop(c : Number, n : Number) -> Number {
    if (c < n) then { return loop(c + 1, n); }
        else { return n; }
}

print(loop(0, 1000));
