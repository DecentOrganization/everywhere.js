import React, {useEffect, useState, useRef} from 'react';
import {format} from "date-fns";
import isEmpty from 'lodash.isempty';
import {Image, Table } from "react-bootstrap";
import PrintIcon from '../assets/images/print-button-svgrepo-com.svg';
import EditIcon from '../assets/images/bmx-pencil.svg';
import Print from './print';
import {useReactToPrint} from "react-to-print";
import {useAsyncState} from "../redux/actions/useAsyncState";
import {StateProperty} from "../redux/reducers";
import TestResultModal from './TestResultModal';
import {Link, useParams, useHistory, useRouteMatch} from "react-router-dom";
import DetailsIcon from "../assets/images/bmx-patient-details-icon.svg";
import DetailsModal from "./detailsModal";

function List({ patient, items }) {
  const { id: patientId,
	    rxhash: selectedHash
	}  = useParams();
  const history = useHistory();
  const match = useRouteMatch();

  const userProfiles = useAsyncState(StateProperty.userProfile);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModal, setShowModal] = useState(false);

  function getLastTestedDate(prescription) {
    if(prescription.data.length > 0)
      return format(new Date(prescription.data[prescription.data.length-1].createdAt), 'MM/dd/yyyy');
    return 'n/a';
  }

  function GetTestResult({prescription}) {
    if(prescription.data.length > 0){
      const results = JSON.parse(prescription.data[prescription.data.length-1].data).covidTestResult;

      if(!results || isEmpty(results))
        return <td>n/a</td>

      if(results.toLowerCase() === 'positive')
        return <td className='positive'>{results}</td>

      return <td className='negative'>{results}</td>
    }
    return <td>n/a</td>;
  }

  function PrintItem({ patient, prescription }) {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
      copyStyles: true
    })

    return (
      <div className='icon' onClick={event => {
        event.stopPropagation();
        handlePrint()
      }}>
        <Image src={PrintIcon} />
        <div style={{ display: "none" }}><Print patient={patient} prescription={prescription} ref={componentRef} /></div>
      </div>
    )
  }

  function getPrescriptions() {
    return items.map((curPrescription, index) => {
      const rowClickHandler = () => history.push(`/patients/${patientId}/rxs/${curPrescription.hash}/`);

      return (
        <tr onClick={rowClickHandler} className='clickable' key={index}>
          <td className='first-row-element'>{patient.lastName}</td>
          <td>{patient.firstName}</td>
          <td>{new Date(patient.dob).toLocaleDateString(undefined, { timeZone: 'UTC' })}</td>
          <td>{getLastTestedDate(curPrescription)}</td>
          <GetTestResult prescription={curPrescription} />
          <td className='action-items last-row-element'>
            <div>
              <div className="icon">
                <Link onClick={event => event.stopPropagation()} to={`/patients/${patientId}/rxs/${curPrescription.hash}/`}>
                    <Image src={DetailsIcon} />
                </Link>
              </div>
              <PrintItem patient={patient} prescription={curPrescription} />
              {['internal', 'prescriber', 'labAgent', 'lab', 'labOrg'].includes(userProfiles.data.currentProfile.profileType) &&
              <Link onClick={event => event.stopPropagation()} to={`/patients/${patientId}/rxs/${curPrescription.hash}/edit`}>
                <div className="icon">
                  <Image src={EditIcon}/>
                </div>
              </Link>
              }
            </div>
          </td>
        </tr>
      );
    })
  }

  const closeModal = () => {
      setShowModal(false);
      setShowDetailsModal(false);
      history.push('..');
  }

  useEffect( () => {
      if (isEmpty(selectedHash))
        return;
      if(match.path.includes('edit'))
        setShowModal(true);
      else
        setShowDetailsModal(true);
  }, [ patientId, selectedHash, match.path ]);

  return (
    <>
      <Table>
        <thead>
        <tr>
          <th>Last Name</th>
          <th>First Name</th>
          <th>Date of Birth</th>
          <th>Date of Results</th>
          <th>Test Results</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {getPrescriptions()}
        </tbody>
      </Table>
      <TestResultModal
        show={showModal}
        closeHandler={() => closeModal() }
      />
      <DetailsModal
        show={showDetailsModal}
        closeHandler={() => closeModal() }
      />

    </>
  )
}

export default List;
