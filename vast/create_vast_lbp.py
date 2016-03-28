from intelanalytics import *
import socket, struct

step1 = True
step2 = False
g_names = get_graph_names()

print g_names

# create a graph with src ip -> src port , dst_ip -> dst port
dataset = r"../hadoop/graphflow/vast/topic_graph.csv"
#SELECT firstseensrcip, firstseendestip, firstseensrcport, firstseendestport, 
#AVG(firstseensrcpayloadbytes) as avgfirstsrcbytes, AVG(firstseendestpayloadbytes) as avgfirstdstbytes, 
#AVG(firstseensrctotalbytes) as avgtotalsrcbytes, AVG(firstseendesttotalbytes) as avgtotaldstbytes, 
#AVG(firstseensrcpacketcount) as avgfirstsrcpkts, AVG(firstseendestpacketcount) as avgfirstdstpkts
#FROM vast_netflow
#GROUP BY firstseensrcip, firstseendestip, firstseensrcport, firstseendestport
schema = [('srcip', str),('dstip', str), ('sport', int32),  ('dport', int32), 
('fs_srcbyte', float32),('fs_dstbyte', float32),('tot_srcbyte', float64),('tot_dstbyte', float64),
('fs_srcpkt', float32),('fs_dstpkt', float32)]

csv_file = CsvFile(dataset, schema, skip_header_lines = 0)

print("Creating DataFrame")

f = BigFrame(csv_file)

print f.inspect(20)

srcips = VertexRule("srcip", f.srcip,{"vertex_type": "L", "lda_topic":0})#may want to add properties
sports = VertexRule("sport", f.sport,{"vertex_type": "R", "lda_topic":0})
dstips = VertexRule("dstip", f.dstip,{"vertex_type": "R"})#may want to add properties
dports = VertexRule("dport", f.dport,{"vertex_type": "L"})
from_edges= EdgeRule("from_port", srcips, sports, {"fs_srcbyte": f.fs_srcbyte,"tot_srcbyte": f.tot_srcbyte,
			"fs_srcpkt": f.fs_srcpkt})
to_edges= EdgeRule("to_port", dstips, dports, {"fs_dstbyte": f.fs_dstbyte,"tot_dstbyte": f.tot_dstbyte,
			"fs_dstpkt": f.fs_dstpkt})

gname = 'vast_netflow_topic_2'

if step1 == True:
	print("Starting first data frame tasks ...")
	print("Creating " + gname)

	g = BigGraph([srcips,sports,from_edges] ,gname)
	print("create task completed")
	g.append([dstips,dports,to_edges])
	print("append task completed")

#if step2 == True:
	#TODO : have to create a new data frame to get connections edges
	#conn_edges= EdgeRule("connects", srcips, dstips, {"conns":f.conn,"srcbyte": f.srcbyte,"dstbyte": f.dstbyte,"srcpkt": f.srcpkt,"dstpkt": f.dstpkt})

