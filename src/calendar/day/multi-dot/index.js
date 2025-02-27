import React, {Component} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import PropTypes from 'prop-types';

import {shouldUpdate} from '../../../component-updater';
import styleConstructor from './style';
import { isObject } from 'lodash';

class Day extends Component {
  static displayName = 'IGNORE';

  static propTypes = {
    // TODO: disabled props should be removed
    state: PropTypes.oneOf(['disabled', 'today', '']),

    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    marking: PropTypes.any,
    onPress: PropTypes.func,
    onLongPress: PropTypes.func,
    date: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);

    this.onDayPress = this.onDayPress.bind(this);
    this.onDayLongPress = this.onDayLongPress.bind(this);
  }

  onDayPress() {
    this.props.onPress(this.props.marking, this.props.date);
  }

  onDayLongPress() {
    this.props.onLongPress(this.props.marking, this.props.date);
  }

  shouldComponentUpdate(nextProps) {
    return shouldUpdate(this.props, nextProps, ['state', 'children', 'marking', 'onPress', 'onLongPress']);
  }

  renderDots(marking) {
    const baseDotStyle = [this.style.dot, this.style.visibleDot];
    if (marking.dots && Array.isArray(marking.dots) && marking.dots.length > 0) {
      // Filter out dots so that we we process only those items which have key and color property
      const validDots = marking.dots.filter(d => d && d.color);
      return validDots.map((dot, index) => {
        if (index <= 2) {
          return (
            <View
              key={dot.key ? dot.key : index}
              style={[
                baseDotStyle,
                {backgroundColor: marking.selected && dot.selectedDotColor ? dot.selectedDotColor : dot.color}
              ]}
            />
          );
        }
      });
    } else if (marking.dots && isObject(marking.dots)) {
      const {dots} = marking
      let count = 0
      let viewDots = []
      for (const key in dots ) {
        if (count <= 2) {viewDots.push(
          <View
              key={key}
              style={[
                baseDotStyle,
                {backgroundColor: marking.selected && dots[key].selectedDotColor ? dots[key].selectedDotColor : dots[key].color}
              ]}
            />
        )
        count += 1}
      }
      return viewDots
    }
    return;
  }

  render() {
    const isWeekend = this.props.day === 0;
    const containerStyle = [this.style.base];
    const textStyle = [isWeekend ? this.style.weekendTextStyle : this.style.text];
    const marking = this.props.marking || {};
    const dot = this.renderDots(marking);
    const isDisabled = typeof marking.disabled !== 'undefined' ? marking.disabled : this.props.state === 'disabled';
    if (marking.selected) {
      containerStyle.push(this.style.selected);
      textStyle.push(this.style.selectedText);
      if (marking.selectedColor) {
        containerStyle.push({backgroundColor: marking.selectedColor});
      }
    } else if (isDisabled) {
      textStyle.push(this.style.disabledText);
    } else if (this.props.state === 'today') {
      containerStyle.push(this.style.today);
      textStyle.push(this.style.todayText);
    }
    return (
      <>
        <TouchableOpacity
          testID={this.props.testID}
          style={containerStyle}
          onPress={this.onDayPress}
          onLongPress={this.onDayLongPress}
          disabled={marking.disableTouchEvent}
          accessibilityRole={isDisabled ? undefined : 'button'}
          accessibilityLabel={this.props.accessibilityLabel}
        >
          <Text allowFontScaling={false} style={textStyle}>
            {String(this.props.children)}
          </Text>
        </TouchableOpacity>
        <View style={this.style.dotContainer}>{dot}</View>
      </>
    );
  }
}

export default Day;
