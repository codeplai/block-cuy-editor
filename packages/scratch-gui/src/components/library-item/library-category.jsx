import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './library-category.css';

class LibraryCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }

    handleToggle = () => {
        this.setState(prevState => ({
            isOpen: !prevState.isOpen
        }));
    };

    render() {
        const {name, iconURL, description, children} = this.props;
        const {isOpen} = this.state;

        return (
            <div className={styles.categoryContainer}>
                <div
                    className={classNames(styles.categoryHeader, {
                        [styles.categoryHeaderOpen]: isOpen
                    })}
                    onClick={this.handleToggle}
                    role="button"
                    tabIndex="0"
                >
                    <div className={styles.categoryHeaderContent}>
                        {iconURL && (
                            <img
                                className={styles.categoryIcon}
                                src={iconURL}
                                alt={name}
                            />
                        )}
                        <div className={styles.categoryInfo}>
                            <span className={styles.categoryName}>{name}</span>
                            {description && (
                                <span className={styles.categoryDescription}>{description}</span>
                            )}
                        </div>
                        <span className={classNames(styles.arrow, {
                            [styles.arrowOpen]: isOpen
                        })}>
                            ▼
                        </span>
                    </div>
                </div>
                
                {isOpen && (
                    <div className={styles.categoryChildren}>
                        {children}
                    </div>
                )}
            </div>
        );
    }
}

LibraryCategory.propTypes = {
    name: PropTypes.string.isRequired,
    iconURL: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.node.isRequired
};

export default LibraryCategory;