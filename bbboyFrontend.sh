#!/bin/bash
WORK_PATH='/html/'
cd $WORK_PATH
# 清除暂存区
git reset --hard origin/master
git clean -f
# 拉取新代码
git pull origin/master
# 开始构建
yarn && yarn build