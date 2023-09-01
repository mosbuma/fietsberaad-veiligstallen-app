import React, {useState, useEffect} from "react";
import Input from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";

import Styles from './Faq.module.css';

import {
  getFaqSections
} from "~/utils/faq";

function Faq({
}: {
}) {
  const dispatch = useDispatch();

  const [faq, setFaq] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await getFaqSections('E1991A95-08EF-F11D-FF946CE1AA0578FB');
      setFaq(response);
    })();
  }, []);

  return (
    <div className="Faq">

      {faq.map((section) => {
        return (
          <details className={`${Styles.details}`}>
            <summary className={`
              rounded
              mb-4
              p-2
              py-3
              font-bold
              text-white
              ${Styles.sectionSummary}
            `}>
              {section.sectionTitle}
              {/*<span className="icon">👇</span>*/}
            </summary>
            <div className="sectionBody p-4">
              {section.q_and_a.map((QA) => {
                return (
                  <details className={Styles.details}>
                    <summary className={`my-2 ${Styles.qaSummary}`}>
                      {QA.Question}
                    </summary>
                    <div className={`
                      mt-2
                      mb-2
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
