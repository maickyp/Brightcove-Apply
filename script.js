(function(){
    'use strict';    

    // Global vars
    let access_token='';
    let account_id = '';
    let videos = {};
    let playlists = {};




    document.querySelector('#Oauth2-btn').addEventListener("click", function (e) {
        e.preventDefault();

        // Load client credentials
        let client_id = document.querySelector('#ClientID-txtbox').value;
        let client_secret = document.querySelector('#SecretClient-txtbox').value;
        let auth_string = 'Basic ' + btoa(client_id + ":" + client_secret);

        // <-----   This is not supposed to happen, access token should be received by this app.  ----->
        account_id = document.querySelector('#AccountID-txtbox').value;
        access_token = document.querySelector('#AccessToken-txtbox').value;


        // Body
        let data = 'grant_type=client_credentials';

        console.log(auth_string);
        // Setting the headers
        let headers = {
            'Authorization' : `Basic ${auth_string}`
        };
        
        // Making the request waiting response
        Request('POST', "https://solutions.brightcove.com/bcls/bcls-proxy/access-token-proxy.php", headers, data).then(function(response){

        // Printing response
        let rqstResponse = JSON.parse(response); 
        console.log(rqstResponse);
        })
    });

    // Get Videos from API
    document.querySelector('#videos-btn').addEventListener("click", function (e) {
        e.preventDefault();

        // Body
        let data = {
        };
        
        // Setting the headers
        let headers = {
            'Authorization' : `Bearer ${access_token}`
        };

        // Making the request waiting response
        Request('GET', `https://cms.api.brightcove.com/v1/accounts/${account_id}/videos`, headers, data).then(function(response){

        // Store info in var
        videos = JSON.parse(response);
        console.log(videos);
        })
    });


    // Get Playlist from API
    document.querySelector('#playlist-btn').addEventListener("click", function (e) {
        e.preventDefault();

        // Body
        let data = {
        };
        
        // Setting the headers
        let headers = {
            'Authorization' : `Bearer ${access_token}`
        };

        // Making the request waiting response
        Request('GET', `https://cms.api.brightcove.com/v1/accounts/${account_id}/playlists`, headers, data).then(function(response){

        // Store info in var
        playlists = JSON.parse(response);
        console.log(playlists);
        })
    });

    // Download both API info into csv files
    document.querySelector('#Download-btn').addEventListener("click", function (e) {
        e.preventDefault();

        // temp local var
        let itemsFormatted = [];

        // Setting the headers for csv convertion
        let headers = {
            video_id: 'Video Id', 
            account_id: "Account Id",
            created_at: "Created at",
            name: "Name",
            economics: "Economics",
            duration: "Duration",
            state: "state",
            tags: "Tags"
        };

        // format data, chosing selected info to be converted
        videos.forEach((item) => {
            itemsFormatted.push({
                video_id: item.id,
                account_id: item.account_id,
                created_at: item.created_at,
                name: item.name.replace(',', ' '),
                economics: item.economics,
                duration: item.duration,
                state: item.state,
                tags: item.tags.join().replaceAll(',', ' ')
            });
        });

        // Exporting info
        exportCSVFile(headers, itemsFormatted, 'Videos');

        // Clear var
        itemsFormatted = [];

        // Setting the headers for csv convertion
        headers = {
            video_id: 'Video Id',
            account_id: "Account Id",
            created_at: "Created at",
            name: "Name",
            type: "Type",
            search: "Tags"
        };

        // format the data
        playlists.forEach((item) => {
            itemsFormatted.push({
                video_id: item.id,
                account_id: item.account_id,
                created_at: item.created_at,
                name: item.name,
                type: item.type,
                search: item.search
            });
        });
        
        
        // Exporting info
        exportCSVFile(headers, itemsFormatted, 'Playlist');

    });

    // Functions


    /**********************************************************************
     *  @fn					- Request
     *
     *  @brief				- This function makes a HTTP Request to a given URL. This request can be with empty body or any info.
     *
     *  @param[in]			- Request Method, eg. Get, Post, Patch, Delete, etc.
     *  @param[in]			- Given URL to make request.
     *  @param[in]			- Headers to apply.
     *  @param[in]			- Body.
     *
     *  @return				- Response as a promise for async use
     *
     *  @Note				- 
     *
     */

    function Request(method, url, headers, data) {
        return new Promise(function (resolve, reject) {

            let request = new XMLHttpRequest();

            request.open(`${method}`, url);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.setRequestHeader('Authorization', headers.Authorization);

            request.onload = function (e) {
                if (this.status == 200) {
                    resolve(this.response);
                }
                else {
                    reject(Error(this.status));
                }
            }

            request.onerror = function () {
                reject(Error('Network Error'));
            }

            request.send(data);
        });
    }

     /**********************************************************************
     *  @fn					- convertToCSV
     *
     *  @brief				- Converts a objects to strings with new lines for further reading pursoses
     *
     *  @param[in]			- Obj to be convert
     *
     *  @return				- String
     *
     *  @Note				- This function was made by Danny Pule and published in medium.com
     *
     */

    function convertToCSV(objArray) {
        let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        let str = '';
    
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in array[i]) {
                if (line != '') line += ','
    
                line += array[i][index];
            }
    
            str += line + '\r\n';
        }
    
        return str;
    }

    
    /**********************************************************************
     *  @fn					- exportCSVFile
     *
     *  @brief				- Take items to strings, make a blob to save csv file.
     *
     *  @param[in]			- Object. Headers to be apply on the first line of the file. 
     *  @param[in]			- Object. Items to be converted.
     *  @param[in]			- String. File name
     *
     *  @return				- None
     *
     *  @Note				- This function was made by Danny Pule and published in medium.com
     *
     */

    function exportCSVFile(headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }
    
        // Convert Object to JSON
        let jsonObject = JSON.stringify(items);
    
        let csv = convertToCSV(jsonObject);
    
        let exportedFilenmae = fileTitle + '.csv' || 'export.csv';
    
        let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            let link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                let url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    

})();