from intelanalytics import *
import socket, struct

g_names = get_graph_names()

print g_names


dataset = r"../hadoop/graphflow/vast/lbp_graph.csv"

schema = [('srcip', str),('dstip', str), ('conn', int32), ('srcbyte', int64),('dstbyte', int64),('srcpkt', int32),('dstpkt', int32)]

csv_file = CsvFile(dataset, schema, skip_header_lines = 1)

print("Creating DataFrame")


f = BigFrame(csv_file)

print f.inspect(20)

srcips = VertexRule("ip", f.srcip,{"vertex_type": "C"})#may want to add properties
dstips = VertexRule("ip", f.dstip,{"vertex_type": "C"})#may want to add properties

conn_edges = EdgeRule("conn_edge", srcips, dstips, {"conns":f.conn,"srcbyte": f.srcbyte,"dstbyte": f.dstbyte,"srcpkt": f.srcpkt,"dstpkt": f.dstpkt})

gname = 'vast_netflow_lbp_1'

print("Creating " + gname)

g = BigGraph([srcips,dstips,conn_edges] ,gname)
print("first task completed")
