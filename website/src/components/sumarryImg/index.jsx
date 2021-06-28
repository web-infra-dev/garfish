import React from 'react';


export function summaryImg (url) {
  return (
    <details class="custom-block details">
      <summary>
        <img src={`${url}`} />
      </summary>
    </details>
  )
}
