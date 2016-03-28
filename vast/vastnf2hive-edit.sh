#!/bin/bash

BBPATH='/user/hadoop/netflow/vast/bb/'
BBINCR=('week1' 'week2')

hive -e "add jar /home/hadoop/src/csv-serde.jar;"

for f in "${BBINCR[@]}"
do
	hive -e "LOAD DATA INPATH '${BBPATH}bb-$f-clean.csv' INTO TABLE vast_bb";
done

