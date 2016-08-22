# Open-Network-Insight.org

For organizations with dynamic data centers and networks, Open Network Insight is an advanced threat detection solution that uses big data analytics, that perform at cloud scale, to provide actionable insights into operational and security threats. Running on Cloudera Enterprise Data Hub (EDH), ONI can analyze billions of events in order to detect unknown threats, insider threats, and gain a new level of visibility into the network.

# **Open Network Insight Demo**
 
ONI-Demo is a standalone installation of the ONI UI

## **Demo SW Requirements**

Pre-requisites:

[Python 2.7.11](https://www.python.org/downloads/) or above
[Node.js](https://nodejs.org/en/download/)

installation:

1. get the demo with `git clone https://github.com/Open-Network-Insight/oni-demo.git`
2. install Python dependencies: `pip install pyzmq jinja2 pandas tornado ipython==3.2.0 jsonschema`
3. install Node.js dependencies: `npm install -g browserify uglifyjs`
4. install and build the ui 

 `cd ./oni-demo/ui/`

 `npm install reactify d3-queue d3-hierarchy`

 `npm install`

 `npm run build-all`

## **Start the Demo**

bash ./runIpython.sh

## **Windows specific**

This demo requires Winpython, which can be downloaded here:

[Winpython Download][1]
[1]:  https://sourceforge.net/projects/winpython/files/latest/download "Winpython Installer"  

Install Winpython under root directory as **C:\winpython**    


## **Downloading Demo**

In order to download Demo code - you can use Download ZIP option from this repository

Unzip the file *oni-demo-1.1.zip* into **C:\winpython\notebooks** folder

## **Running Demo**

In order to run ONI demo, start **Jupyter Notebook.exe** that is located under winpython folder

A Web browser will be opened to http://localhost:8888/tree


# **Open Network Insight Demo**

Inside the demo you will find 3 separate data sets to explore,

* Flow
* DNS
* Proxy

these events all occur on the same date: 2016-07-08

### *Opening Suspicious Connects Web Page*

Copy and paste the following link into your browser

### Flow
[http://localhost:8889/files/ui/flow/suspicious.html#date=2016-07-08](http://localhost:8889/files/ui/proxy/suspicious.html#date=2016-07-08)

### DNS
[http://localhost:8889/files/ui/dns/suspicious.html#date=2016-07-08](http://localhost:8889/files/ui/dns/suspicious.html#date=2016-07-08)

### Proxy
[http://localhost:8889/files/ui/proxy/suspicious.html#date=2016-07-08](http://localhost:8889/files/ui/proxy/suspicious.html#date=2016-07-08)

In the Demo, which contains similar functionality to Open Network Insight User Interface, you can:

  * Select rows in Suspicious Connects Frame
    * Icons for Reputation Services & Geolocation examples
  * Move & Select Network View objects
    * Displaying Chord Diagrams
  * Display Detail View information (by selecting a Suspicious Connect row)
  * Running Edge Investigation notebook

### *Opening Storyboard Web Page*

In this page you will find example Storyboards with real findings in the provided example data
Copy and paste the following links into your browser

### Flow
[http://localhost:8889/files/ui/flow/storyboard.html#date=2016-07-08](http://localhost:8889/files/ui/flow/storyboard.html#date=2016-07-08)

### DNS
[http://localhost:8889/files/ui/dns/storyboard.html#date=2016-07-08](http://localhost:8889/files/ui/dns/storyboard.html#date=2016-07-08)

### Proxy
[http://localhost:8889/files/ui/proxy/storyboard.html#date=2016-07-08](http://localhost:8889/files/ui/proxy/storyboard.html#date=2016-07-08)
