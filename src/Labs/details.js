import React, {useEffect, useState} from 'react';
import {
  Link,
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch
} from 'react-router-dom';
import { useAsyncState } from "../redux/actions/useAsyncState";
import { StateProperty } from "../redux/reducers";
import LabDetails from '../Labs/labDetails';
import NewPrescription from '../Prescriptions/new'
import { request } from "../requests"
import Button from "react-bootstrap/Button";

function Details({ alert }) {
  const state = useAsyncState(StateProperty.labs);
  const [users, setUsers] = useState([]);
  const { id } = useParams();
  const [labDetails, setLabDetails] = useState(state.data.labs &&
    state.data.labs.data.find &&
    state.data.labs.data.find($lab => $lab.id === parseInt(id)));
  const history = useHistory();
  const match = useRouteMatch();
  const userProfiles = useAsyncState(StateProperty.userProfile);
  useEffect(() => {
    request(`labOrgs/${id}/profile`, 'GET')
      .then(response => {
        setLabDetails(response.profile)
      })
      .catch(error => {
        history.replace('..')
      });
  }, [id, history])

  useEffect(() => {
    if (!labDetails) return;
    request(`labOrgs/${id}/users`, 'GET')
      .then(usersResponse => {
        setUsers([...usersResponse.users.admins, ...usersResponse.users.nonAdmins]);
      })
  }, [labDetails,id])


  if (!labDetails) return <></>

  return (
    <>
      <Route exact path={`${match.path}`}>
        {userProfiles.data.currentProfile.admin &&
          <Link to={`${match.url}/invite`} className='float-right'>
            <Button className='styled-form-button px-5'>New Agent</Button>
          </Link>
        }
      </Route>
      <Switch>
        <Route exact path={`${match.path}/newPrescription`}>
          <NewPrescription alert={alert} />
        </Route>
        <Route path={`${match.path}`}>
          <LabDetails labDetails={labDetails} users={users} />
        </Route>
      </Switch>
    </>
  )
}

export default Details;
