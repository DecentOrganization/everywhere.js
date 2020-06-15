import React, {useCallback, useState} from "react";
import {
  Col,
  Image,
  Pagination,
  Row,
  Table
} from "react-bootstrap";
import {useAsyncState} from "../redux/actions/useAsyncState";
import {StateProperty} from "../redux/reducers";
import {request} from "../requests";
import {format} from "date-fns";
import TrashIcon from "../assets/images/trash.svg";
import ConfirmModal from "./confirmModal";

function List({alert}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentPhysician, setCurrentPhysician] = useState({});
  const [updateList, setUpdateList] = useState(true);
  const [showNextPage, setShowNextPage] = useState(false);


  const userProfiles = useAsyncState(StateProperty.userProfile);
  const physiciansLoader = useCallback(async () => {
      return request(`prescribers?currentPage=${currentPage}`, 'GET')
        .then(results => {
          request(`prescribers?currentPage=${currentPage+1}`, 'GET')
            .then((response) => {
              setShowNextPage(response.prescribers.length > 0);
            })
          if(updateList) setUpdateList(false)
          return results
        });
    },
    [currentPage, updateList, setUpdateList]);
  const physicians = useAsyncState(StateProperty.physicians, physiciansLoader);

  function deletePhysicianModal(physician) {
    setCurrentPhysician(physician);
    setShowModal(true);
  }

  function deletePhysician() {
    request(`prescribers/${currentPhysician.id}/profile`, 'DELETE')
      .then(() => {
        alert({ message:'Physician was successfully deleted', variant:'success'});
        setCurrentPhysician({});
        setUpdateList(true);
      })
      .catch((e) => {
        alert({ message:'Error deleting physician', variant:'danger'});
        console.log('Error deleting physician', e);
      })
  }

  function getPhysicianList() {
    return physicians.data.prescribers.map((curPhysician, index) => {
      return <tr key={index}>
        <td className='first-row-element'>{curPhysician.lastName}</td>
        <td>{curPhysician.firstName}</td>
        <td>{curPhysician.email}</td>
        <td>{format(new Date(curPhysician.dob),'MM/dd/yyyy')}</td>
        <td>{curPhysician.deaNumber}</td>
        <td className='action-items last-row-element'>
          <div onClick={() => deletePhysicianModal(curPhysician)}>
            <Image src={TrashIcon} />
          </div>
        </td>
      </tr>
    })
  }

  return(
    <>
      <Row>
        <Col>
          <h1>Physicians</h1>
        </Col>
      </Row>
      <Table>
        <thead>
        <tr>
          <th>Last Name</th>
          <th>First Name</th>
          <th>Email</th>
          <th>Date of Birth</th>
          <th>DEA Number</th>
        </tr>
        </thead>
        <tbody>
        {getPhysicianList()}
        </tbody>
      </Table>
      {userProfiles.data.currentProfile.profileType === 'internal' && (
        <Pagination as={'Container'} className='justify-content-end'>
          { physicians.data.pagination.from > 0 &&
          <Pagination.First onClick={() => setCurrentPage(1)}/>
          }
          { physicians.data.pagination.from > 1 &&
          <Pagination.Prev onClick={() => setCurrentPage(Math.max(currentPage - 1,1))}/>
          }
          <Pagination.Item active>{currentPage}</Pagination.Item>
          { showNextPage &&
          <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)}/>
          }
        </Pagination>
      )}
      <ConfirmModal
        show={showModal}
        message={`${currentPhysician.firstName} ${currentPhysician.lastName}`}
        closeHandler={() => setShowModal(false)}
        confirmHandler={() => {
          deletePhysician()
          setShowModal(false);
        }}/>
    </>
  )
}

export default List;
