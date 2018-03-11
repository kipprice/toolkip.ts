namespace KIP.Dates {

	/**
	 * @file Helper functions for working with dates
	 * @author Kip Price
	 * @version 1.0
	 * @since 1.1
	 */

	export interface IDateDifferences {
		years?: number;
		months?: number;
		days?: number;
		hours?: number;
		minutes?: number;
		seconds?: number;
		milliseconds?: number;
	}

	/**
	 *	Finds the difference in days between two date objects
	 *	@param {Date} a - The first date to compare
	 *	@param {Date} b - The second date to compare
	 *	@param {Boolean} [signed] - If true, will take the difference in order passed in (e.g. A - B)
	 *	@param {Boolean} [includeTime] - If true, will take the ms difference instead of the day difference
	 *  @param {boolean} [returnMilli] - If true, returns a value in milliseconds even if milliseconds weren't compared
	 **/
	export function dateDiff(a: Date, b: Date, signed?: boolean, includeTime?: boolean, returnMilli?: boolean): number {
		let ms: number;
		let diff: number;
		let dir: number;

		ms = (1000 * 60 * 60 * 24);

		// clear time data if we don't care about it
		if (!includeTime) {
			a = clearTimeInfo(a, true);
			b = clearTimeInfo(b, true);
		}

		// calculate the date diff in milliseconds
		if ((a > b) || signed) {
			diff = ((a as any) - (b as any));
		} else {
			diff = ((b as any) - (a as any));
		}

		// if we don't want the response in milliseconds, return the days value (including fractional component if appropriate)
		if (!returnMilli) {
			diff = diff / ms;
		}

		return diff;
	};

	/**
	 * Grabs the current day, default without any time data
	 * @param  {boolean} include_time - True if we shouldn't exclude time data
	 * @return {Date}                 Today's date
	 */
	export function getToday(include_time?: boolean): Date {
		"use strict";
		let ret: Date;

		ret = new Date();

		if (include_time) return ret;

		// Clear out time data
		ret = clearTimeInfo(ret);

		return ret;
	};

	/**
	 * Clear out all time info associated with the date, including the timezone
	 * @param date - the original date to clear data from
	 * @returns The time-agnostic date
	 */
	export function clearTimeInfo (date: Date, clearTZ?: boolean): Date {
		let dateStr: string = shortDate(date);
		let outDate: Date;
		if (clearTZ) {
			outDate = new Date(dateStr + " 00:00Z");	// Convert to this timezone and to the particular date
		} else {
			outDate = new Date(dateStr);
		}
		return outDate;
	}

	/**
	 * Compares two dates to determine the business day difference between them
	 * @param a - The first date to compare
	 * @param b - The second date to compare
	 * @param signed - True if we should compare the dates in order (e.g. Date A - Date B)
	 * @param includeTime - If true, also compares the time
	 * @param returnMilli - Returns the date difference in milliseconds instead of days
	 * @returns The business-date diff between the 2 dates
	 */
	export function businessDateDiff(a: Date, b: Date, signed?: boolean, includeTime?: boolean, returnMilli?: boolean): number {
		"use strict";
		let diff: number;
		let dayOfWeek: number;
		let dir: number;
		let idx: number;

		// Calculate the standard date
		diff = dateDiff(a, b, signed, includeTime, returnMilli);

		// Grab the 2nd day of the week, because we skip the first day
		dayOfWeek = (b > a? a.getDay() : b.getDay()) + 1;
		dayOfWeek %= 7;
		if (dayOfWeek < 0) { dayOfWeek = 6; }

		// Loop through the days between the two dates and pull out any weekend days
		let weekendDays: number = 0;
		for (idx = 0; idx < Math.abs(diff); idx += 1) {

			// If this day is a weekend, add it to the # of weekend days
			if (dayOfWeek === 0 || dayOfWeek === 6) {
				weekendDays += 1;
			}

			// grab the next day, based on the date direction
			dayOfWeek += 1;
			dayOfWeek %= 7;
			if (dayOfWeek < 0) { dayOfWeek = 6; }
		}

		// determine if we need to add or subtract to change the dates
		if (diff < 0) {
			dir = -1;
		} else {
			dir = 1;
		}
		return diff - (weekendDays * dir);

	};

	/**
	 * Gets the display string of the date in a short format (MM/DD/YYYY)
	 * @param {Date} dt - The date to get the short date for
	 */
	export function shortDate(dt: Date): string {
		"use strict";
		if (!dt) { return ""; }
		let yr: number;
		yr = getShortYear(dt);
		return (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + yr;
	};


	// InputDateFmt
	//-------------------------------------------
	/**
	 * Converts the date into the format used by date inputs
	 * @param {Date} dt - The date to convert
	 */
	export function inputDateFmt(dt: Date): string {
		"use strict";
		let m: any;
		let d: any;
		let y: any;

		y = dt.getFullYear();

		m = (dt.getMonth() + 1);
		if (m < 10) m = "0" + m;

		d = +dt.getDate();
		if (d < 10) d = "0" + d;
		return (dt.getFullYear() + "-" + m + "-" + d);
	};

	// InputToDate
	//-------------------------------------------
	/**
	 * Takes a string returned by an input field for a date and converts it to a JS date
	 * @param {string} iDt - The date string to convert (if available)
	 * @param {string} iTime - The time string to convert (if available)
	 */
	export function inputToDate(iDt?: string, iTime?: string): Date {
		let outDate: Date;

		// Handle the input date string
		if (iDt) {
			let dtArr: string[] = iDt.split("-");
			outDate = new Date(+dtArr[0], +dtArr[1] - 1, +dtArr[2])
		} else {
			outDate = getToday();
		}

		// Handle the input time string
		if (iTime) {
			let timeArr: string[] = iTime.split(":");
			outDate.setHours(+timeArr[0]);
			outDate.setMinutes(+timeArr[1]);
		}

		return outDate;
	};

	/**
	 * Gets the display string of the time in a short format (HH:MM)
	 * @param {Date} dt - The date to extract the time from
	 * @param {Boolean} withExtra - If true, will display as HH:MM AM/PM instead of military time
	 */
	export function shortTime(dt: Date, withExtra?: boolean): string {
		"use strict";
		let min: number;
		let min_str: string;
		let hours: number;
		let half: string;

		//Get the minutes value for the current date
		min = +dt.getMinutes();
		hours = +dt.getHours();
		half = "";

		//We need to pad minutes to get a recognizable time format
		if (min < 10) {
			min_str = "0" + min;
		} else {
			min_str = min.toString();
		}

		if (withExtra) {
			half = " AM";
			if (hours >= 12) half = " PM";
			if (hours > 12) hours -= 12;
		}

		//Return unpadded hours (but in military time) and padded minutes.
		return hours + ":" + min_str + half;
	};

	/**
	 * Gets the display string for a date and time
	 * @param {Date} dt - The date to extract the formatted string from
	 * @param {Boolean} withExtra - If true, uses AM/PM format instead of military time.
	 */
	export function shortDateTime(dt: Date, with_extra?: boolean): string {
		"use strict";
		return shortDate(dt) + " " + shortTime(dt, with_extra);
	};

	export function stopwatchDisplay(milli: number, noLeadingZeros, noBlanks) {
		"use strict";
		let seconds: number;
		let minutes: number;
		let hours: number;
		let days: number;
		let arr: string[];

		let sec_str: string;
		let min_str: string;
		let hr_str: string;

		seconds = Math.floor(milli / 1000); milli %= 1000;
		minutes = Math.floor(seconds / 60); seconds %= 60;
		hours = Math.floor(minutes / 60); minutes %= 60;
		days = Math.floor(hours / 24); hours %= 24;

		// Add the leading zeros if appropriate
		if (!noLeadingZeros) {
			sec_str = addLeadingZeroes(2, seconds);
			min_str = addLeadingZeroes(2, minutes);
			hr_str = addLeadingZeroes(2, hours);
		} else {
			sec_str = seconds.toString();
			min_str = minutes.toString();
			hr_str = hours.toString();
		}

		return days + "D  " + hr_str + ":" + min_str + ":" + sec_str + " '" + milli;
	};

	export function addToDate(date: Date, counts: IDateDifferences): Date {

		if (counts.milliseconds) {
			date.setMilliseconds(date.getMilliseconds() + counts.milliseconds);
		}

		if (counts.seconds) {
			date.setSeconds(date.getSeconds() + counts.seconds);
		}

		if (counts.minutes) {
			date.setMinutes(date.getMinutes() + counts.minutes);
		}

		if (counts.hours) {
			date.setHours(date.getHours() + counts.hours);
		}

		if (counts.days) {
			date.setDate(date.getDate() + counts.days);
		}

		if (counts.months) {
			date.setMonth(date.getMonth() + counts.months);
		}

		if (counts.years) {
			date.setFullYear(date.getFullYear() + counts.years);
		}

		return date;

	};

	/** 
	 * gets the name of the month given a particular date
	 * @param date - the date to get the month from
	 * @param [short] - If true, returns the short version of the month name
	 * @returns string of month name
	 */
	export function getMonthName(date: Date, short?: boolean): string {
		switch (date.getMonth()) {
			case 0:
				if (short) return "Jan";
				return "January";
			case 1:
				if (short) return "Feb";
				return "February";
			case 2:
				if (short) return "Mar";
				return "March";
			case 3:
				if (short) return "Apr";
				return "April";
			case 4:
				return "May";
			case 5:
				if (short) return "Jun";
				return "June";
			case 6:
				if (short) return "Jul";
				return "July";
			case 7:
				if (short) return "Aug";
				return "August";
			case 8:
				if (short) return "Sept";
				return "September";
			case 9:
				if (short) return "Oct";
				return "October";
			case 10:
				if (short) return "Nov";
				return "November";
			case 11:
				if (short) return "Dec";
				return "December";
		}
		return "";
	};

	/**
	 * Get Day Of Week
	 * @param date - the date to grab the d.o.w. from
	 * @param [short] - If true, returns the short version of the month name
	 * @returns string of day-of-week name
	 */
	export function getDayOfWeek(date: Date, short?: boolean): string {
		"use strict";
		switch (date.getDay()) {
			case 0:
				if (short) return "Sun";
				return "Sunday";
			case 1:
				if (short) return "Mon";
				return "Monday";
			case 2:
				if (short) return "Tues";
				return "Tuesday";
			case 3:
				if (short) return "Wed";
				return "Wednesday";
			case 4:
				if (short) return "Thurs";
				return "Thursday";
			case 5:
				if (short) return "Fri";
				return "Friday";
			case 6:
				if (short) return "Sat";
				return "Saturday";
		}
		return "";
	};

	/** grab the short version of the year */
	export function getShortYear(date: Date): number {
		return (+date.getFullYear() % 100);
	}

	export function isWeekend (date: Date): boolean {
		let dayOfWeek: number = date.getDay();
		if (dayOfWeek === 0) { return true; }	// SUNDAY
		if (dayOfWeek === 6) { return true; }	// SATURDAY
		return false;							// EVERYTHING ELSE
	}

	export function isToday (date: Date): boolean {
		let today: Date = getToday();
		let cloneDate: Date = clearTimeInfo(date);
		return isSameDate(today, cloneDate);
	}

	export function isSameDate (dateA: Date, dateB: Date): boolean {
		if (shortDate(dateA) === shortDate(dateB)) { return true; }
		return false;
	}

	/**
	 * getDisplayDuration
	 * 
	 * Create a display string for a time duration
	 * @param 	counts	The duration to stringify
	 * @returns	The display duration string 
	 * 
	 */
	export function getDisplayDuration(counts: IDateDifferences): string {
		// update up to the highest available range for dates
		_updateDateDifferences(1000, counts, "milliseconds", "seconds");
		_updateDateDifferences(60, counts, "seconds", "minutes");
		_updateDateDifferences(60, counts, "minutes", "hours");
		_updateDateDifferences(24, counts, "hours", "days");
		_updateDateDifferences(30, counts, "days", "months");
		_updateDateDifferences(12, counts, "months", "years");

		// create the string based on the counts
		let out: string[] = [];
		
		if (counts.years) { out.push(_createPluralString(counts.years, "year")); }
		if (counts.months) { out.push(_createPluralString(counts.months, "month")); }
		if (counts.days) { out.push(_createPluralString(counts.days, "day")); }
		if (counts.hours) { out.push(_createPluralString(counts.hours, "hour")); }
		if (counts.minutes) { out.push(_createPluralString(counts.minutes, "minute")); }
		if (counts.seconds) { out.push(_createPluralString(counts.seconds, "second")); }
		if (counts.milliseconds) { out.push(_createPluralString(counts.milliseconds, "millisecond")); }

		return out.join(" ");
	}

	function _updateDateDifferences (divisor: number, out: IDateDifferences, startKey: keyof IDateDifferences, endKey: keyof IDateDifferences): IDateDifferences {

		if (!out[startKey]) { out[startKey] = 0; }
		if (!out[endKey]) { out[endKey] = 0; }
		let dividend: number = out[startKey];

		let remainder: number = dividend % divisor;
		let quotient: number = Math.floor(dividend / divisor);

		out[startKey] = remainder;
		out[endKey] += quotient;

		return out;
	}

	function _createPluralString (amount: number, singular: string, plural?: string): string {
		if (amount === 1) {
			return amount + " " + singular;
		} else {
			if (!plural) { plural = singular + "s"; }
			return amount + " " + plural;
		}
	}

}