#!/bin/sh

NAME=$1
DATANAME=$2
REP=$3

for t in `seq 1 $REP`;
  do node "src/$NAME.js" < "data/$DATANAME.dat" \
    | grep 'time' \
    | gsed -e 's/time: \(.\+\)ms/\1/'
done
