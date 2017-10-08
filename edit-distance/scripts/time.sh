#!/bin/sh

NAME=$1
DATANAME=$2
REP=$3

$(dirname $0)/repeat.sh $NAME $DATANAME $REP \
  | est -po '((transpose true))' '[avg $0, sd $0]' -
