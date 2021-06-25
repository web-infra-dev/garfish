import React from 'react';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import { members } from '@site/src/data/team';

function WebsiteLink({to, children}) {
  return (
    <Link to={to}>
      {children || (
        <Translate id="team.profile.websiteLinkLabel">website</Translate>
      )}
    </Link>
  );
}

function TeamProfileCard({ className, name, children, githubUrl, username, avatar }) {
  return (
    <div className={className}>
      <div className="card card--full-height">
        <div className="card__header">
          <div className="avatar avatar--vertical" title={username}>
            <img
              className="avatar__photo avatar__photo--xl"
              src={avatar}
              alt={username}
            />
            <div className="avatar__intro" style={{ marginTop: 12 }}>
              <h3 className="avatar__name">{name}</h3>
            </div>
          </div>
        </div>
        <div className="card__body">{children}</div>
        {/* <div className="card__footer">
          <div className="button-group button-group--block">
            {githubUrl && (
              <a className="button button--secondary" href={githubUrl}>
                GitHub
              </a>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
}

function TeamProfileCardCol(props) {
  return (
    <TeamProfileCard {...props} className={'col col--3 margin-bottom--lg'} />
  );
}

export function ActiveTeamRow() {
  members.sort((pre, next)=>{
    return pre.username.charCodeAt(0) - next.username.charCodeAt(0);
  });

  return (
    <div className="row">
      {members.map(member => {
        const { name, username, description = '', ...rest } = member;
        return (
          <TeamProfileCardCol
            key={username}
            username={username}
            name={name}
            {...rest}>
            <Translate id={`team.${username}`}>
              {description}
            </Translate>
          </TeamProfileCardCol>
        );
      })}
    </div>
  );
}
