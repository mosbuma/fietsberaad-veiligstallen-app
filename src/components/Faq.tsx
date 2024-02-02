import React, { useState, useEffect } from "react";
import Styles from './Faq.module.css';
import { faq } from '@prisma/client';

import {
  getFaqSections
} from "~/utils/faq";

function Faq({
}: {
  }) {
  const [faq, setFaq] = useState<faq[]>([]);

  useEffect(() => {
    (async () => {
      const response: faq[] = await getFaqSections('E1991A95-08EF-F11D-FF946CE1AA0578FB');
      setFaq(response);
    })();
  }, []);

  return (
    <div className="Faq">

      {faq.map((section: faq) => {
        return (
          <details className={`${Styles.details}`}>
            <summary className={`
              rounded
              p-2
              py-3
              font-bold
              text-white
              ${Styles.sectionSummary}
            `}>
              {section.sectionTitle}
              {/*<span className="icon">👇</span>*/}
            </summary>
            <div className="p-4">
              {section.q_and_a.map((QA) => {
                return (
                  <details className={Styles.details}>
                    <summary className={`my-1 ${Styles.qaSummary}`}>
                      {QA.Question}
                    </summary>
                    <div className={`
                      mt-4
                      mb-4
                      -mx-2 px-4
                      py-2
                      ${Styles.qaAnswer}
                    `}>
                      {QA.Answer}
                    </div>
                  </details>
                )
              })}
            </div>
          </details>
        )
      })}
    </div>
  );
}

export default Faq;
