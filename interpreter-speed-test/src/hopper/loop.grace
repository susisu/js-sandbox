method loop(n : Number) -> Number {
    var c : Number := 0;
    while {c < n} do {
        c := c + 1;
    }
    return n;
}

print(loop(1000));
