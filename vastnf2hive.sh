#!/bin/bash

FPATH='/user/hadoop/netflow/vast/nf/'
FINCR=('chunk1' 'chunk2' 'chunk3' 'week2')
BBPATH = '/user/hadoop/netflow/vast/bb/'
BBINCR=('week1' 'week2')
for f in "${FINCR[@]}"

do
	hive -e "LOAD DATA INPATH '${FPATH}nf-$f.csv' INTO TABLE vast_netflow";
done

cd bb
hadoop fs -mkdir ${BBPATH}
hadoop fs -put * ${BBPATH}
for f in "${BBINCR[@]}"
do
	hive -e "LOAD DATA INPATH '${BBPATH}bb-$f-clean.csv' INTO TABLE vast_bb";
done

