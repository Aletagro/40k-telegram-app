import React from 'react'

import map from 'lodash/map'
import size from 'lodash/size'

import Styles from './styles/ListStatus.module.css'

const Svg = ({children}) => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>{children}</svg>

// Состояние списка прямо в билдере: готов к сохранению или есть проблемы. Раскрывается в перечень.
// getAction(issue) возвращает функцию, которая ведёт к месту исправления, или null, если у проблемы нет понятного места
const ListStatus = ({issues, expanded, onToggle, statusRef, getAction}) => {
    const hasIssues = size(issues) > 0

    const renderIssue = (issue, index) => {
        const action = getAction ? getAction(issue) : null
        return <li key={`${index}-${issue.message}`} className={Styles.issue}>
            {action
                ? <button type='button' className={Styles.issueButton} onClick={action}>
                    <span className={Styles.issueText}>{issue.message}</span>
                    <span className={Styles.issueFix}>Fix<Svg><path d='M9 5l7 7-7 7' /></Svg></span>
                </button>
                : issue.message
            }
        </li>
    }

    return <div ref={statusRef} className={`${Styles.card} ${hasIssues ? Styles.error : Styles.ok}`}>
        <button type='button' className={Styles.head} onClick={hasIssues ? onToggle : undefined} aria-expanded={expanded} disabled={!hasIssues}>
            <span className={Styles.mark}>
                <Svg>{hasIssues ? <path d='M12 7v6M12 17h.01' /> : <path d='M5 12.5l4.5 4.5L19 7.5' />}</Svg>
            </span>
            <span className={Styles.text}>
                <span className={Styles.title}>{hasIssues ? 'List needs fixes' : 'List is ready'}</span>
                <span className={Styles.subtitle}>{hasIssues ? `${size(issues)} ${size(issues) === 1 ? 'issue' : 'issues'}` : 'No errors found'}</span>
            </span>
            {hasIssues ? <span className={`${Styles.chevron} ${expanded ? Styles.chevronOpen : ''}`}><Svg><path d='M6 9l6 6 6-6' /></Svg></span> : null}
        </button>
        {expanded && hasIssues ? <ul className={Styles.list}>{map(issues, renderIssue)}</ul> : null}
    </div>
}

export default ListStatus
