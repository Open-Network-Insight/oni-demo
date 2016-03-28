SELECT firstseensrcip, firstseendestip, firstseensrcport, firstseendestport, 
AVG(firstseensrcpayloadbytes) as avgfirstsrcbytes, AVG(firstseendestpayloadbytes) as avgfirstdstbytes, 
AVG(firstseensrctotalbytes) as avgtotalsrcbytes, AVG(firstseendesttotalbytes) as avgtotaldstbytes, 
AVG(firstseensrcpacketcount) as avgfirstsrcpkts, AVG(firstseendestpacketcount) as avgfirstdstpkts
FROM vast_netflow
GROUP BY firstseensrcip, firstseendestip, firstseensrcport, firstseendestport