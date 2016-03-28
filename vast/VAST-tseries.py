import csv
import operator
import math
import numpy as np
import time
import sys

adapt_bin = True
poly_idx = False
#initialize matrix at 10000X1440, may grow later
# could we divide the matrix into blocks so that each seen_before search is a bit more optimized?
# could preallocate, then just add to the end when full
scale = 1
binct = 100000
bstep = 1
rend = 4.8*np.uint64(math.pow(10,18))

if adapt_bin:
	hist = np.loadtxt('bindata',dtype=(np.uint64))
        #print hist
	### create index function
	#incr = (rend)/(binct*bstep);
	incr = 1
	print hist[5]
	w = len(hist);
	splits = np.zeros(w,np.uint64);
	splits = hist

	splits = np.concatenate(([np.uint64(0)],hist,[np.uint64(rend)]))

	
	for n in range(0):
		splits1 = splits
		w = len(splits);	
		splits = np.zeros(w*2-2,np.uint64);
		for j in range(w-1):
			#print j+1,j,j/2,j/2+1
			splits[2*(j)] = splits1[j]
			splits[2*(j)+1] = splits1[j] + np.uint64((splits1[j+1]-splits1[j])/2)
		splits[len(splits)-1] = rend
	print splits,splits.shape
else:
	w = 20000
	splits = np.linspace(0,4000000000,w*2+1)



if poly_idx:
	### create index function
	xp = range(len(splits))
	p = np.polyfit(xp,splits,10)
	f = open("fitdata", "w")
	np.savetxt(f, p)
	
f = open("splitdata", "w")
np.savetxt(f, splits,fmt="%1d")

#################
# search/sort section
#################
ticks = 1440

#print 'initializing workers ...'
#t0 = time.time()
w = len(splits)
#for j in range(w):
#	globals()['IP'+str(j)] = np.zeros((1,2+ticks),np.int64);

#t1 = time.time()


newIP = np.zeros((1,2+ticks),np.int64);
#print w,'workers initialized in',t1-t0
wrk = w



opct = 0;
srtct = 0;
padct = 0;

parsefile = sys.argv[1]
with open(parsefile, 'rb') as f:
    reader = csv.reader(f,delimiter=',')
    rowct = 1
    for row in reader:
        #print row #debug only
        
#(0)tstart TIMESTAMP,(1)tend TIMESTAMP,(2)tdur FLOAT,
#(3)sip STRING,(4)dip STRING,sport INT,dport INT,proto STRING,flag STRING,fwd INT ,stos INT,
#ipkt INT,ibyt INT,opkt INT,obyt INT
	# convert IP address fields to long values
	try:
		octets= row[6].split('.')
	except IndexError:
		break
	n=3
	src_long = 0
	for oct in octets:
	        try:
		     src_long = src_long + long(oct)*long(math.pow(256,n))
		     n = n-1
		except ValueError:
		     break
	n=3
	
	dst_long = 0
	octets= row[7].split('.')
	for oct in octets:
	        try:
		     dst_long = dst_long + long(oct)*long(math.pow(256,n))
		     n = n-1
		except ValueError:
		     break
	

	try:
		byteval = int(row[15])
	except ValueError:
		byteval = 0
	#quantize start time
	# timeval to minutes - either truncate seconds or round 
	#dtstr = row[1].split(' ')
	#tstart=0
	#if len(dtstr) > 1:
	timestr = row[2].split(':')
	tstart = int(timestr[0])*60+int(timestr[1])
		
	
	srcdex = np.uint64(np.uint64(dst_long))*np.uint64(math.pow(10,9))+np.uint64(np.float64(src_long)*(math.pow(10,-1)))
	#if then to calculate seen before
	if src_long < dst_long:
		newIP[0,0] = src_long;
		newIP[0,1] = dst_long;

	else:
		newIP[0,0] = dst_long;
		newIP[0,1] = src_long;
	#print(src_long,dst_long,srcdex)
	
	seen_before = False
	idx_found = False
 	#  binary search for seen_before
	found = False
	j = 2
	m = 1
	kold = 0
	
	while not found:
		srtct = srtct+1
		k = (m*w)/j
		m = m*2
		j = j*2
		#print k
	      	if srcdex <= splits[k]:
			m = m-1
		else:
			if srcdex <= splits[k+1]:
				opidx = k
				#print opidx
				found = True
			m = m+1

		if kold == k:
			opidx = k
			break
		kold = k
	
	k = opidx

	#if k - (len(splits)-1) < 1:
	#	k = (len(splits)-1)-1
	if not 'IP'+str(k) in globals():
		globals()['IP'+str(k)] = np.zeros((1,2+ticks),np.uint64);
	  	seen_before = True;
	  	if newIP[0,0] == src_long:
			flow = 1
	  	else:
			flow = -1
	  	globals()['IP'+str(k)][0,tstart+2] = byteval * flow
	else:
		if srcdex < (splits[k+1]-splits[k])/2:
			lbound = 0
			ubound = len(globals()['IP'+str(k)])-1
			sbidx = k
			#print newIP[0,0],k,splits[k+2]
			for j in range(lbound,ubound,1):

				opct = opct + 1
				if (src_long == globals()['IP'+str(k)][j,0] or src_long == globals()['IP'+str(k)][j,1]) and (dst_long == globals()['IP'+str(k)][j,0] or dst_long == globals()['IP'+str(k)][j,1]):
				  TS_idx = j
				  seen_before = True;
				  if newIP[0,0] == src_long:
					flow = 1
				  else:
					flow = -1
				  globals()['IP'+str(k)][j,tstart+2] = globals()['IP'+str(k)][j,tstart+2] + byteval * flow
				  #print rowct, 'top reached'
				  break
		else:
			lbound = 0
			ubound = len(globals()['IP'+str(k)])-1
			sbidx = k
			for j in range(ubound,lbound,-1):

				opct = opct + 1
				if (src_long == globals()['IP'+str(k)][j,0] or src_long == globals()['IP'+str(k)][j,1]) and (dst_long == globals()['IP'+str(k)][j,0] or dst_long == globals()['IP'+str(k)][j,1]):
				  TS_idx = j
				  seen_before = True;
				  if newIP[0,0] == src_long:
					flow = 1
				  else:
					flow = -1					  
				  globals()['IP'+str(k)][j,tstart+2] = globals()['IP'+str(k)][j,tstart+2] + byteval * flow
				  #print rowct, 'bottom reached'
				  break
			


        if not seen_before:  # you should be able to jump straight to the range to add
       	      	srtct = srtct + 1
              	k = sbidx
		#t0 = time.time()
		flow = 1
		if len(globals()['IP'+str(k)])==1 and globals()['IP'+str(k)][0,0] != 0:
			globals()['IP'+str(k)][0,0] = newIP[0,0]
			globals()['IP'+str(k)][0,1] = newIP[0,1]
			globals()['IP'+str(k)][0,tstart+2] = byteval * flow
		else:
			if srcdex  < (splits[k+1]-splits[k])/2:	             		
				globals()['IP'+str(k)] = np.concatenate([newIP,globals()['IP'+str(k)]])
				globals()['IP'+str(k)][0,tstart+2] = globals()['IP'+str(k)][0,tstart+2] + byteval * flow
			else:
				globals()['IP'+str(k)] = np.concatenate([globals()['IP'+str(k)],newIP])
				globals()['IP'+str(k)][len(globals()['IP'+str(k)])-1,tstart+2] = globals()['IP'+str(k)][len(globals()['IP'+str(k)])-1,tstart+2] + byteval * flow
		#t1 = time.time()
		#print 'time:',t1-t0
		#print(srcdex,k,splits[k])
		




	if rowct % 10000 == 0:
		total = 0
		maxcol = 0
		worker = 0;
		for j in range(w):
			if 'IP'+str(j) in globals():
				total = total + len(globals()['IP'+str(j)])
				if len(globals()['IP'+str(j)]) > maxcol:
					maxcol = len(globals()['IP'+str(j)])
					worker = j
        	print rowct,total, maxcol,worker,opct,srtct
        	#np.set_printoptions(threshold='nan')
        	#print rowct,opct,srtct

        # save every 10th pair into vector
	if rowct == 5000000:
		f = open("maxworkerdata", "w")
		np.savetxt(f, globals()['IP'+str(worker)],fmt="%1d",delimiter=",")
		queues = np.zeros(1);
		print queues
		for j in range(w):
			if 'IP'+str(j) in globals():
				queues = np.append(queues,len(globals()['IP'+str(j)]))
				#queues[j] = len(globals()['IP'+str(j)])
		f = open("workerdata", "w")		
		np.savetxt(f, queues,fmt="%1d",delimiter=",")	
        	#break
        rowct = rowct + 1

print rowct
print 'total number of operations',opct + srtct
print 'total number of rows', rowct

# saving:
savefile = "matrixdata"+sys.argv[2]
f = open(savefile, "w")
for k in range(w):
	if 'IP'+str(k) in globals():
	#if globals()['IP'+str(k)][0,0] != 0:	
		np.savetxt(f, globals()['IP'+str(k)],fmt="%1d",delimiter=",")
