CREATE EXTERNAL TABLE IF NOT EXISTS vast_netflow
(TimeSeconds float,parsedDate TIMESTAMP,dateTimeStr STRING,ipLayerProtocol INT,
ipLayerProtocolCode STRING,firstSeenSrcIp STRING,firstSeenDestIp STRING,
firstSeenSrcPort INT,firstSeenDestPort INT,moreFragments STRING,contFragments STRING,
durationSeconds INT,firstSeenSrcPayloadBytes INT,firstSeenDestPayloadBytes INT,
firstSeenSrcTotalBytes INT,firstSeenDestTotalBytes INT,firstSeenSrcPacketCount INT,
firstSeenDestPacketCount INT,recordForceOut STRING)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ',' 
STORED AS textfile
LOCATION '/user/hadoop/hiveflow/vastnf/';

add jar /home/hadoop/src/csv-serde.jar;

CREATE EXTERNAL TABLE IF NOT EXISTS vast_bb
(id INT,hostname STRING,servicename STRING,currenttime INT,statusVal STRING,
bbcontent STRING,receivedfrom STRING,diskUsagePercent INT,pageFileUsagePercent INT,
numProcs INT,loadAveragePercent INT,physicalMemoryUsagePercent INT,connMade INT,parsedDate TIMESTAMP)
ROW FORMAT serde 'com.bizo.hive.serde.csv.CSVSerde'
STORED AS textfile
LOCATION '/user/hadoop/hiveflow/vastbb/'
TBLPROPERTIES ("skip.header.line.count"="1");


