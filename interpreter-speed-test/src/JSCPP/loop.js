var JSCPP = require("JSCPP");

var src = `
#include <iostream>
using namespace std;

int loop(int n) {
    int i;
    for (i = 0; i < n; i++) {

    }
    return n;
}

int main() {
    cout << loop(100000) << endl;
    return 0;
}
`;

JSCPP.run(src, "");
