mkdir vast
cd vast
mkdir nf
# move vast data to hdfs
hadoop fs -mkdir /user/hadoop/netflow/
hadoop fs -mkdir /user/hadoop/netflow/vast/
hadoop fs -put /home/hadoop/ipython/vast/nf/nf-* /user/hadoop/netflow/vast/nf/.
 hadoop fs -ls /user/hadoop/netflow/vast/nf/

