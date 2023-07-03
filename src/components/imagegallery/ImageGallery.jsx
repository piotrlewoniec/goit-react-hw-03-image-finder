import PropTypes from 'prop-types';
import css from './ImageGallery.module.css';
import React from 'react';

export const ImageGallery = React.forwardRef((props, ref) => (
  <ul ref={ref} className={css.imagegallery} onClick={props.action}>
    {/* <!-- Zbiór <li> z obrazami --> */}
    {props.children}
  </ul>
));

ImageGallery.propTypes = {
  children: PropTypes.node,
  action: PropTypes.func,
};
