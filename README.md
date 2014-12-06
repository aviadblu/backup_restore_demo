<h3>How to test:</h3>
=====================

API avalibable at
http://ec2-54-149-42-58.us-west-2.compute.amazonaws.com:8080

<h4><u>Contact object:</u></h4>
contact_obj = {<br>
&nbsp;&nbsp;&nbsp;name:{ <br>
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;first: String, <br>
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;last: String <br>
&nbsp;&nbsp;&nbsp;	}, <br>
   &nbsp;&nbsp;&nbsp; phone_1: String, <br>
   &nbsp;&nbsp;&nbsp; email: String, <br>
    } <br>
<h4><u>Sync POST methods:</u></h4>
1) Insert new Contact: <br>
http://ec2-54-149-42-58.us-west-2.compute.amazonaws.com:8080/sync <br>
request: {action:"insert",contact_obj} <br>

2) Update Contact: <br>
http://ec2-54-149-42-58.us-west-2.compute.amazonaws.com:8080/sync <br>
request: {action:"update", contact_id ,contact_obj} <br>

3) Remove Contact: <br>
http://ec2-54-149-42-58.us-west-2.compute.amazonaws.com:8080/sync <br>
request: {action:"update", contact_id} <br>

<h4><u>Sync GET methods:</u></h4>
1) Get all Contacts: <br>
http://ec2-54-149-42-58.us-west-2.compute.amazonaws.com:8080/sync/all <br>

<h4><u>Snapshots POST methods:</u></h4>

1) Restore Snapshot: <br>
http://ec2-54-149-42-58.us-west-2.compute.amazonaws.com:8080/snapshots <br>
request: {action:"restore",timestamp: "some timestamp, e.g. 1317070690"} <br>

<h4><u>Snapshots GET methods:</u></h4>
1) Get all Snapshots data: <br>
http://ec2-54-149-42-58.us-west-2.compute.amazonaws.com:8080/snapshots/all <br>