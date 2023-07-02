import PropTypes from 'prop-types';
import css from './ImageGallery.module.css';

export const ImageGallery = ({ children, action }) => (
  <ul className={css.imagegallery} onClick={action}>
    {/* <!-- Zbiór <li> z obrazami --> */}
    {children}
  </ul>
);

ImageGallery.propTypes = {
  children: PropTypes.node,
  action: PropTypes.func,
};
