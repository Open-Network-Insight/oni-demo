# **Open Network Insight Demo**

ONI-Demo can be downloaded and run standalone on a **Windows Laptop** 

## **Demo SW Requirements**

This demo requires Winpython, which can be downloaded here:

[Winpython Download][1]
[1]:  https://sourceforge.net/projects/winpython/files/latest/download "Winpython Installer"  

Note: Install Winpython under root directory as **C:\winpython**    


## **Downloading Demo**

In order to download Demo code - you can use Download ZIP option from this repository

![Alt][2]

[2]: docs/download-zip.bmp "Download ZIP File"

Unzip the file *oni-demo-win.zip* into **C:\winpython\notebooks** folder

## **Running Demo**

In order to run ONI demo, start **Jupyter Notebook.exe** that is located under winpython folder

A Web browser will be opened in the following path

![Alt][3]

[3]: docs/JupyterStartup.bmp "Jupyter Initial Startup"

### *Opening Suspicious Connects Web Page*

Copy and paste the following link into your browser

    http://localhost:8888/files/oni-demo-win/index_sconnects.html

Index_sconnects page looks similar to the image below

![Alt][4]

[4]: docs/Index_sconnects.bmp "Index Sconnects Web Page"

In the Demo, which contains similar functionality to Open Network Insight User Interface, you can:

  * Select rows in Suspicious Connects Frame
    * Icons for Reputation Services & Geolocation examples
  * Move & Select Network View objects
    * Displaying Chord Diagrams
  * Display Detail View information (by selecting a Suspicious Connect row)
  * Use IP Address Filter
  * Running Edge Investigation notebook

### *Opening Storyboard Web Page*

Copy and paste the following link into your browser

    http://localhost:8888/files/oni-demo-win/storyboard_sconnect.html

Storyboard page looks similar to the image below

![Alt][5]

[5]: docs/Storyboard_sconnect.bmp "Storyboard Web Page" 

In this web page, you can:

* Select in between 3 example events under *Executive Threat Briefing*
  * Port 123 Scan
  * Port 80 DoS
  * Botnet 
