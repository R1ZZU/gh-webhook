#!/bin/sh

run() {
  echo \$ $1
  eval $1
}

run "cd $1"
run "git clean -dfx"
run "git pull origin master"
run "npm i"
run "npm run build"
