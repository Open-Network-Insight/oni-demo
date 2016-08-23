###GTI (gti)
DNS Global Threat Intelligence module.

This module is called in dns_oa.py for IP reputation check. The GTI module makes use of two third-party services, McAfee GTI and Facebook ThreatExchange. Each of these services are represented by a sub-module in this project, McAfee GTI is implemented by sub-module gti and Facebook ThreatExchange by sub-module fb. For more information see [Folder Structure](https://github.com/Open-Network-Insight/oni-oa/blob/1.0.1-dns_oa_readme_creation/ipython/dns/README.md#folder-structure).

## How to implement a new reputation service for DNS OA

DNS GTI comes with two sub-modules and they correspond to the reputation services we are supporting by default.
  - gti: implements logic to call and return results from McAfee reputation service.
  - fb: implements logic to call and return results from facebook ThreatExchange reputation service.

 It's possible to add new reputation services by implementing a new sub-module, to do that developers should follow
 these steps:

1. Map the responses of the new reputation service with DNS reputation table.

    | Key  | Value |
    |---|---|
    |UNVERIFIED|-1|
    |NONE      |0 |
    |LOW       |1 |
    |MEDIUM    |2 |
    |HIGH      |3 |

2. Add a new configuration for the new reputation service in gti_config.json.

        {
			"targe_columns" :  [3],
			"gti" : { …
			},
			"fb" : {…
			},
			"mynewreputationservice":{ "server" : "rep.server.com",
				                        "user" : "user-name"
			}
		}
3. Create file structure for new sub-module.

        [solution-user@edge-server]$ cd ~/ipython/dns/gti/
        [solution-user@edge-server]$ mkdir mynewreputationservice
        [solution-user@edge-server]$ cd mynewreputationservice

4. Add _ _init_ _.py file.
5. Add a new file *reputation.py*. Each sub-module should contain a reputation.py file.
6. Write your code in reputation.py. The code should contain the follow structure:

    6.1 Constructor:

    Constructor should receive one *config* parameter. This parameter correspond to the specific configuration of the
    service in gti_config.json. When running, dns_oa.py will iterate through each service in the configuration file
    and create a new instance of each sub-module sending the corresponding configuration for each new instance.

        def __init__(sel,conf):
            #TODO: read configuration.
            # i.e.
            # self._server = configuration['sever']
            # self._user = configuration['user']

    6.2 Implement *check* method:

    Check method should receive a list of urls or IPs to be evaluated and return a dictionary with each element's
    reputation in the following format {"url":"reputation"}.
    *Reputation* should be a string with 3 elements separated by colon **":"** where the first part is the reputation
    service name, second the reputation label and third the reputation value already defined in step 1.

        def check(self,url_list):
            # connect to service
            # call service for each url in list or bulk query
            # translate results to service:label:value format
            # create new entry to result dictionary {"url":"service:label:value"}
            # return a dictionary with each url from url_list and the corresponding reputation

     Results example:

        {
            "dns.somethin.com" : "mynewreputationservice:MEDIUM:2",
			"other.dns.test.org" : "mynewreputationservice:LOW:1",
			"someother.test.com" : "mynewreputationservice:HIGH:3"
		}
