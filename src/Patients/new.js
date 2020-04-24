import React, {useState} from 'react';
import {Col} from 'react-bootstrap';
import {useHistory} from "react-router-dom";
import {request} from "../requests";
import Form from './form';
import Alert from "react-bootstrap/Alert";
import {useAsyncState} from "../redux/actions/useAsyncState";
import {StateProperty} from "../redux/reducers";
import {dataUpdateAction} from "../redux/reducers/async";
import {useDispatch} from "react-redux";

function New({ alert }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const profiles = useAsyncState(StateProperty.userProfile);
  const patients = useAsyncState(StateProperty.patients);
  function handleSubmit(event, formData) {
    event.preventDefault();
    let data;
    if(profiles.data.currentProfile.profileType === 'patient'){
      data = {...formData, userId: profiles.data.currentProfile.userId}
    }else{
      data = formData;
    }

    return request('patients', 'POST', data)
      .then(response => {
        alert({ message: 'New Patient added successfully', variant: 'primary' });
        dispatch(dataUpdateAction(StateProperty.patients, [...patients.data.patients, response.profile]))
        history.push('/patients');
      }).catch(error => {
        setError(error);
      })
  }

  return (
    <Col>
      <h1>New Patient</h1>
      <Form submitHandler={handleSubmit}/>
      {error && <Alert variant='danger'>{error}</Alert>}
    </Col>
  )
}
export default New;
