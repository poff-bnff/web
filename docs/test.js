// let newD = new Date(e_screening.start + ET.utc2)
        // strapi_screening.dateTime = newD
        let utc2 = '+0200'
        let eventival = '2020-11-13 19:00:00'
        let d = new Date ('2020-11-13 19:00:00')
        let nDate = new Date('2020-11-13 19:00:00' + utc2)
        let moment = new Date()
        let ofSet = d.getTimezoneOffset()/60
        let ofSet2 = nDate.getTimezoneOffset()/60
        let ofSet3 = moment.getTimezoneOffset()/60
        console.log(eventival, d, 'antud aeg>>>>', ofSet, 'antud aeg+utc2-', ofSet2, 'hetkest-', ofSet3);
        // if(ofSet > 0){
        //     utc3 = '-0' + Math.abs(ofSet) +'00'
        // }else{
        //     utc3 = '+0' + Math.abs(ofSet) +'00'
        // }
        let utc3 = (ofSet > 0 ? '-0' + Math.abs(ofSet) +'00' : '+0' + Math.abs(ofSet) +'00')
        let nDate2 = new Date('2020-11-13 19:00:00' + utc3)
        console.log(utc3, '------', nDate2)

        // kas eestis on suve v6i talve aeg

        let currentDate = new Date()





        function is_DST_Used_In_This_TimeZone() {
            let Jan_Date
            let jan_Timezone_OffSet
            let July_Date
            let july_Timezone_OffSet
            let offsetsNotEqual
            let today = new Date() //Create a date object that is now
            let thisYear = today.getFullYear() //Get the year as a number
            Jan_Date = new Date(thisYear, 0, 1);//Month is zero indexed - Jan is zero
            jan_Timezone_OffSet = Jan_Date.getTimezoneOffset();
            console.log('jan_Timezone_OffSet: ' + jan_Timezone_OffSet)
            July_Date = new Date(thisYear, 6, 1);
            july_Timezone_OffSet = July_Date.getTimezoneOffset();
            console.log('july_Timezone_OffSet: ' + july_Timezone_OffSet)
            offsetsNotEqual = july_Timezone_OffSet !== jan_Timezone_OffSet;//True if not equal
            console.log('offsetsNotEqual: ' + offsetsNotEqual);
            return offsetsNotEqual //If the offsets are not equal for summer and
                 //winter then the only possible reason is that DST is used for
                 //this time zone
          }
        //   console.log(is_DST_Used_In_This_TimeZone())
