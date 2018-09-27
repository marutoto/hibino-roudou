(function () {

    function difff(baseH, baseM, targetH, targetM) {
        var base   = baseH   * 60 + baseM
        var target = targetH * 60 + targetM

        var diffMin = base - target

        var isMinus = false
        if (diffMin < 0) {
            isMinus = true
        }
        var diffMinAbs = Math.abs(diffMin)
        var hour = Math.floor(diffMinAbs / 60)
        var min  = diffMinAbs % 60

        return [isMinus, hour, min]
    }

    // -- 所定労働時間
    var syotei = (function () {
        var trs = Array.prototype.slice.call(document.querySelectorAll('.infotpl table tbody tr'))
        var shoteiTr = trs.find(function (tr) {
            return tr.querySelector('th').innerHTML.trim() === '所定労働日数'
        })
        var shoteiMatched = shoteiTr.querySelector('td').innerHTML.trim().match(/(\d+)/)
        return Number(shoteiMatched[1])
    })()

    // -- 経過日数・実労働時間 （前日まで。当日は含めない）
    var jitsu = (function () {
        var passedDateCnt = 0
        var absenceDateCnt = 0
        var errorDateCnt = 0
        var timeH = 0
        var timeM = 0

        // ---

        var hibinoganbariTrs = Array.prototype.slice.call(document.querySelectorAll('table.note tr'))
        var titleTr = hibinoganbariTrs[0]
        hibinoganbariTrs.shift() // タイトル行削除
        hibinoganbariTrs.pop()   // 合計行削除

        var tdEqDate    = 0 // 0: 日付
        var tdEqHoliday = 1 // 1: 休日区分
        var tdEqYukyu   = 2 // 2: 勤怠状況
        // var tdEqShukkin = 3 // 3: 実働出勤
        // var tdEqTaikin  = 4 // 4: 実働退勤
        var tdEqRoudou  = 5 // 5: 労働時間

        var today = new Date()

        hibinoganbariTrs.forEach(function (tr, i) {
            var tds = Array.prototype.slice.call(tr.querySelectorAll('td'))

            // -- 休日チェック
            if ('' !== tds[tdEqHoliday].innerHTML.trim()) {
                return // 休日
            }

            // -- 日付チェック（本日以降かどうか）
            var dateMatched = tds[tdEqDate].innerHTML.trim().match(/(\d+)\/(\d+)/)
            var tdMonth = Number(dateMatched[1])
            var tdDate  = Number(dateMatched[2])

            if (today.getDate() <= tdDate) {
                return // 本日以降
            }

            // -- 経過日数
            passedDateCnt++

            // -- 欠勤日数（申請中含む）
            if (0 <= tds[tdEqYukyu].innerHTML.search('欠')) {
                absenceDateCnt++
                return
            }

            // -- 勤怠エラー日数（手動打刻申請中、など）
            if (tr.style.backgroundColor === 'pink') {
                // ↓ これでもいい
                // tr.getAttribute('style') // -> 'background-color: pink'
                errorDateCnt++
                return
            }

            // -- 実労働時間
            // [例外判定・処置] 承認済み半休
            if (0 <= tds[tdEqYukyu].innerHTML.search('午前休') || 0 <= tds[tdEqYukyu].innerHTML.search('午後休')) {
                var roudou = tds[tdEqRoudou].innerHTML.trim()
                if ('04:00' === roudou) {
                    // 半休取得して、残り半日の勤怠が確定していない場合（手動打刻など。レアケース）
                    timeH += 8
                } else {
                    var roudouMatched = roudou.match(/(\d+):(\d+)/)
                    timeH += Number(roudouMatched[1])
                    timeM += Number(roudouMatched[2])
                }
                return
            }

            // [正常]
            var roudou = tds[tdEqRoudou].innerHTML.trim()
            if ('' !== roudou) {
                var roudouMatched = roudou.match(/(\d+):(\d+)/)
                timeH += Number(roudouMatched[1])
                timeM += Number(roudouMatched[2])
            }
        })

        return [passedDateCnt, absenceDateCnt, errorDateCnt, timeH, timeM]
    })()
    var passedDateCnt      = jitsu[0]
    var absenceDateCnt     = jitsu[1]
    var errorDateCnt       = jitsu[2]
    var timeH              = jitsu[3]
    var timeM              = jitsu[4]

    // -- Calc
    var syoteiHour = syotei * 8
    var syoteiMin = syoteiHour * 60

    var remainDateCnt = syotei - passedDateCnt

    // roudouTotal
    var roudouTotal = (function () {
        // 現状
        var totalHour = timeH + Math.floor(timeM / 60)
        var totalMin  = timeM % 60

        // 見込み
        var totalHourExpected = totalHour
        var totalMinExpected  = totalMin
        if (0 < absenceDateCnt) {
            totalHourExpected += absenceDateCnt * 8
        }
        if (0 < errorDateCnt) {
            totalHourExpected += errorDateCnt * 8
        }

        return [totalHour, totalMin, totalHourExpected, totalMinExpected]
    })()
    var roudouTotalHour         = roudouTotal[0]
    var roudouTotalMin          = roudouTotal[1]
    var roudouTotalHourExpected = roudouTotal[2]
    var roudouTotalMinExpected  = roudouTotal[3]

    // roudouRemain
    var roudouRemain = (function () {
        // 現状
        var remainHour = syoteiHour - roudouTotalHour
        var remainMin  = 0
        if (0 < roudouTotalMin) {
            remainHour--
            remainMin = 60 - roudouTotalMin
        }

        // 見込み
        var remainHourExpected = remainHour
        var remainMinExpected  = remainMin
        if (0 < absenceDateCnt) {
            remainHourExpected -= absenceDateCnt * 8
        }
        if (0 < errorDateCnt) {
            remainHourExpected -= errorDateCnt * 8
        }

        return [remainHour, remainMin, remainHourExpected, remainMinExpected]
    })()
    var roudouRemainHour         = roudouRemain[0]
    var roudouRemainMin          = roudouRemain[1]
    var roudouRemainHourExpected = roudouRemain[2]
    var roudouRemainMinExpected  = roudouRemain[3]

    // roudouRemainAvg
    var roudouRemainAvg = (function () {
        // 現状
        var avgHour = 0
        var avgMin  = Math.ceil((roudouRemainHour * 60 + roudouRemainMin) / remainDateCnt)
        if (60 <= avgMin) {
            avgHour = Math.floor(avgMin / 60)
            avgMin  = avgMin % 60
        }

        // 見込み
        var avgHourExpected = 0
        var avgMinExpected  = Math.ceil((roudouRemainHourExpected * 60 + roudouRemainMinExpected) / remainDateCnt)
        if (60 <= avgMinExpected) {
            avgHourExpected = Math.floor(avgMinExpected / 60)
            avgMinExpected  = avgMinExpected % 60
        }

        return [avgHour, avgMin, avgHourExpected, avgMinExpected]
    })()
    var roudouRemainAvgHour         = roudouRemainAvg[0]
    var roudouRemainAvgMin          = roudouRemainAvg[1]
    var roudouRemainAvgHourExpected = roudouRemainAvg[2]
    var roudouRemainAvgMinExpected  = roudouRemainAvg[3]

    // roudouAheadBehind
    var roudouAheadBehind = (function () {
        // 現状
        var d = difff(8, 0, roudouRemainAvgHour, roudouRemainAvgMin)
        var isBehind = d[0]
        var hour     = d[1] * remainDateCnt
        var min      = d[2] * remainDateCnt
        if (60 <= min) {
            hour = hour + Math.floor(min / 60)
            min  = min % 60
        }

        // 見込み
        var dExpected = difff(8, 0, roudouRemainAvgHourExpected, roudouRemainAvgMinExpected)
        var isBehindExpected = dExpected[0]
        var hourExpected     = dExpected[1] * remainDateCnt
        var minExpected      = dExpected[2] * remainDateCnt
        if (60 <= minExpected) {
            hourExpected = hourExpected + Math.floor(minExpected / 60)
            minExpected  = minExpected % 60
        }

        return [isBehind, hour, min, isBehindExpected, hourExpected, minExpected]
    })()
    var isBehind                      = roudouAheadBehind[0]
    var roudouAheadBehindHour         = roudouAheadBehind[1]
    var roudouAheadBehindMin          = roudouAheadBehind[2]
    var isBehindExpected              = roudouAheadBehind[3]
    var roudouAheadBehindHourExpected = roudouAheadBehind[4]
    var roudouAheadBehindMinExpected  = roudouAheadBehind[5]

    // -- Out
    var res1  = syotei
    var res2  = syoteiHour
    var res3  = passedDateCnt
    var res4  = remainDateCnt
    var res5  = absenceDateCnt
    var res6  = errorDateCnt
    var res7  = ('000' + roudouTotalHour).slice(-3)
    var res8  = ('00' + roudouTotalMin).slice(-2)
    var res9  = ('000' + roudouTotalHourExpected).slice(-3)
    var res10 = ('00' + roudouTotalMinExpected).slice(-2)
    var res11 = ('000' + roudouRemainHour).slice(-3)
    var res12 = ('00' + roudouRemainMin).slice(-2)
    var res13 = ('00' + roudouRemainAvgHour).slice(-2)
    var res14 = ('00' + roudouRemainAvgMin).slice(-2)
    var res15 = ('000' + roudouAheadBehindHour).slice(-2)
    var res16 = ('00' + roudouAheadBehindMin).slice(-2)
    var res17 = isBehind
    var res18 = ('000' + roudouRemainHourExpected).slice(-3)
    var res19 = ('00' + roudouRemainMinExpected).slice(-2)
    var res20 = ('00' + roudouRemainAvgHourExpected).slice(-2)
    var res21 = ('00' + roudouRemainAvgMinExpected).slice(-2)
    var res22 = ('000' + roudouAheadBehindHourExpected).slice(-2)
    var res23 = ('00' + roudouAheadBehindMinExpected).slice(-2)
    var res24 = isBehindExpected

    var cleared         = syoteiHour <= roudouTotalHour
    var clearedExpected = syoteiHour <= roudouTotalHourExpected

    console.log(
`
※ 前日までのデータで算出

# 所定XX
    - 所定日数: ${ res1 }日
    - 所定時間: ${ res2 }時間

# 前日までの計測
    - 経過日数: ${ res3 }日
    - 残日数: ${ res4 }日

    - 勤怠異常日数（各種申請中の日を含む）
        - 欠勤: ${ res5 }日
        - エラー: ${ res6 }日（打刻申請中、等を含む）

    - 労働時間
        - 現状: ${ res7 }:${ res8 }
        - 見込: ${ res9 }:${ res10 }

# 結論
    ## 現状`
+(
cleared ?
`
    - もう働かなくてええんやで！
        - やったやね`
:
`
    - 今日を含めてあと
        - 月末までに ${ res11 }:${ res12 } 働くんやで
        - 1日平均で ${ res13 }:${ res14 } 働くんやで`
)+
`
    - 以降毎日8h働くと
        - ${ res15 }:${ res16 } ${ res17 ? '足りない' : 'の総残業時間' }やで

    ## 見込み（勤怠異常が発生している日に、8h労働したとみなして算出した場合）`
+(
clearedExpected ?
`
    - もう働かなくてええんやで！
        - やったやね`
:
`
    - 今日を含めてあと
        - 月末までに ${ res18 }:${ res19 } 働くんやで
        - 1日平均で ${ res20 }:${ res21 } 働くんやで`
)+
`
    - 以降毎日8h働くと
        - ${ res22 }:${ res23 } ${ res24 ? '足りない' : 'の総残業時間' }やで
`
    )

})()
