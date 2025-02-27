import PropTypes from 'prop-types';
import XDate from 'xdate';
import React, {Component} from 'react';
import {View} from 'react-native';
import dateutils from '../dateutils';
import {xdateToData, parseDate} from '../interface';
import {SELECT_DATE_SLOT} from '../testIDs';
import styleConstructor from './style';
import Calendar from '../calendar';
import Day from '../calendar/day/basic';
import PeriodDay from '../calendar/day/period';
import MultiDotDay from '../calendar/day/multi-dot';
import MultiPeriodDay from '../calendar/day/multi-period';
import CustomDay from '../calendar/day/custom';

const EmptyArray = [];

class Week extends Component {
  static displayName = 'IGNORE';

  static propTypes = {
    ...Calendar.propTypes,
    /** the current date */
    current: PropTypes.any
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);
  }

  getWeek(date) {
    if (date) {
      const current = parseDate(date);
      const daysArray = [current];
      let dayOfTheWeek = current.getDay() - this.props.firstDay;
      if (dayOfTheWeek < 0) {
        // to handle firstDay > 0
        dayOfTheWeek = 7 + dayOfTheWeek;
      }

      let newDate = current;
      let index = dayOfTheWeek - 1;
      while (index >= 0) {
        newDate = parseDate(newDate).addDays(-1);
        daysArray.unshift(newDate);
        index -= 1;
      }

      newDate = current;
      index = dayOfTheWeek + 1;
      while (index < 7) {
        newDate = parseDate(newDate).addDays(1);
        daysArray.push(newDate);
        index += 1;
      }

      return daysArray;
    }
  }

  getDayComponent() {
    const {dayComponent, markingType} = this.props;

    if (dayComponent) {
      return dayComponent;
    }

    switch (markingType) {
      case 'period':
        return PeriodDay;
      case 'multi-dot':
        return MultiDotDay;
      case 'multi-period':
        return MultiPeriodDay;
      case 'custom':
        return CustomDay;
      default:
        return Day;
    }
  }

  getDateMarking(day) {
    const {markedDates} = this.props;
    if (!markedDates) {
      return false;
    }

    const dates = markedDates[day.toString('yyyy-MM-dd')] || EmptyArray;
    if (dates.length || dates) {
      return dates;
    } else {
      return false;
    }
  }

  // renderWeekNumber (weekNumber) {
  //   return <Day key={`week-${weekNumber}`} theme={this.props.theme} marking={{disableTouchEvent: true}} state='disabled'>{weekNumber}</Day>;
  // }

  renderDay(day, id) {
    const {current} = this.props;
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);

    let state = '';
    if (this.props.disabledByDefault) {
      state = 'disabled';
    } else if ((minDate && !dateutils.isGTE(day, minDate)) || (maxDate && !dateutils.isLTE(day, maxDate))) {
      state = 'disabled';
    } else if (!dateutils.sameMonth(day, parseDate(current))) {
      // for extra days
      state = 'disabled';
    } else if (dateutils.sameDate(day, XDate())) {
      state = 'today';
    }

    // hide extra days
    if (current && this.props.hideExtraDays) {
      if (!dateutils.sameMonth(day, parseDate(current))) {
        return <View key={id} style={this.style.emptyDayContainer} />;
      }
    }

    const DayComp = this.getDayComponent();
    const dayDate = day.getDate();
    const dateAsObject = xdateToData(day);

    return (
      <View style={this.style.dayContainer} key={id}>
        <DayComp
          testID={`${SELECT_DATE_SLOT}-${dateAsObject.dateString}`}
          date={dateAsObject}
          marking={this.getDateMarking(day)}
          state={state}
          theme={this.props.theme}
          onPress={this.props.onDayPress}
          onLongPress={this.props.onDayPress}
          disableAllTouchEventsForDisabledDays={this.props.disableAllTouchEventsForDisabledDays}
          day={day.getDay()}
        >
          {dayDate}
        </DayComp>
      </View>
    );
  }

  render() {
    const {current} = this.props;
    const dates = this.getWeek(current);
    const week = [];

    if (dates) {
      dates.forEach((day, id) => {
        week.push(this.renderDay(day, id));
      }, this);
    }

    // if (this.props.showWeekNumbers) {
    //   week.unshift(this.renderWeekNumber(item[item.length - 1].getWeek()));
    // }

    return (
      <View style={this.style.container}>
        <View style={[this.style.week, this.props.style]}>{week}</View>
      </View>
    );
  }
}

export default Week;
