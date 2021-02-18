(function(){
    'use strict';    


    document.querySelector('#LoadData-btn').addEventListener("click", function(e){
        e.preventDefault();

        // d3.csvParse(FileAttachment("temperature.csv").text())

        
        const text = await FileAttachment("Videos.csv").text();

        console.log(text);


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
    

})();