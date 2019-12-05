import React, { Component } from 'react';
import {
  Modal,
  Button,
  Form,
  InputGroup,
  Col,
  Row,
  ButtonToolbar,
  Container
} from 'react-bootstrap';
import { SketchPicker } from 'react-color'; 
import Loader from 'react-loader-spinner';
import { Dimmer } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icon from '@fortawesome/free-solid-svg-icons';
import { AgGridReact } from 'ag-grid-react';
import ReactPlayer from 'react-player'
import api from '../../services/api';
import { confirmAlert } from 'react-confirm-alert';
import { NotificationManager } from 'react-notifications';

import './styles.css';


class ModalBackground extends Component {
  
  state = { 
    show: false, 
    shop: [],
    departament: [],
    shopAndDeptoGrid: [],
    screenData: [],
    loadingPage: false,
    backgroundMidia: [],
    selectedImage: [],
    imageID: "",
  }
  
  componentDidMount(){
    this.loadGrid();
    this.loadShop();
  }

  clear(){
    document.getElementById('background-image').src = "./images/background.jpg";
    document.getElementById('screenPreviewBackground').style.border = "1px dashed black";
    this.setState({ 
      show: false, 
      departament: [],
      screenData: [],
      loadingPage: false,
      backgroundMidia: [],
      selectedImage: [],
      imageID: "",
    });
  }

  loadShop = async () => {
    const response = await api.post('SelectShop.php', {"application_name": "MIPP"});
    this.setState({shop:response.data});  
  }

  loadDepartament = async (shop_id) => {
    const response = await api.post('SelectDepartament.php', {"shop_id": shop_id});
    this.setState({departament:response.data}); 
    document.getElementById('background-image').src = "./images/background.jpg";
    document.getElementById('screenPreviewBackground').style.border = "1px dashed black";
  }

  loadBackground = async (shop_id, departament_id) => {
    const response = await api.post('SelectBackgroundMedia.php', {"shop_id": shop_id, "departament_id": departament_id});
    this.setState({backgroundMidia:response.data}); 
    this.state.backgroundMidia.map(backgroundMidia => (
      document.getElementById('background-image').src = "data:image/jpeg;base64," + backgroundMidia.midia,
      document.getElementById('screenPreviewBackground').style.border = "0",
      this.setState({imageID:backgroundMidia.midia_id})
    ));
  }

  loadImageGrid = async (type) => {
    this.setState({loadingPage: true});
    const response = await api.post('SelectImages.php', {"type": type});
    this.setState({imageGrid:response.data});
    this.setState({isImage:true});
    this.setState({loadingPage: false});
  }  

  loadGrid = async () => {
    this.setState({loadingPage: true});
    const response = await api.post('SelectShopAndDepto.php', {"application_name": "MIPP"});
    await this.setState({shopAndDeptoGrid:response.data}); 
    this.setState({loadingPage: false});
  }

  loadScreenImage = async (image_id) => {
    this.setState({loadingPage: true})
    const response = await api.post('SelectMedia.php', {"id": image_id});
    await this.setState({selectedImage:response.data}); 
    this.state.selectedImage.map(image => (
      document.getElementById('background-image').src = "data:image/jpeg;base64," + image.midia,
      document.getElementById('screenPreviewBackground').style.border = "0",
      this.setState({imageID:image.midia_id})
    ));
    this.setState({loadingPage: false});
  }


  constructor(props, context){
    super(props, context);
    
    this.handleShowBackground = this.handleShowBackground.bind(this);
    this.handleCloseBackground = this.handleCloseBackground.bind(this);

    this.backgroundDatatable = {
      columnDefs: [{
        headerName: "LOJA", 
        field: "shop_id",
        width: 265,
        sortable: true
      }, 
      {
        headerName: "DEPARTAMENTO",
        field: "depto_id",
        width: 265,
        sortable: true
      }],
      // Imagem
      columnDefsImage: [{
        headerName: "CODIGO", 
        field: "id",
        width: 120,
      }, 
      {
        headerName: "DESCRIÇÃO",
        field: "description",
        width: 265,
      },
      {
        headerName: "VERSÃO",
        field: "media_version",
        width: 120,
      }],
      rowSelection: "single",
    }
  }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  };
  
  // Função botões 

  handleSave = async () => {   
    let shop_id = document.getElementById("selectShop").options[document.getElementById("selectShop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("selectDepto").options[document.getElementById("selectDepto").selectedIndex].getAttribute('id');
    let media_id = this.state.imageID;

    if(shop_id && departament_id && media_id){
      this.setState({loadingPage: true});
      const response = await api.post('UpdateBackground.php', {
        "shop_id": shop_id,
        "departament_id":departament_id,
        "media_id": media_id
      });
      if(response.status === 200){
        NotificationManager.success('Informações atualizadas!', 'Sucesso!', 5000);
      } else{
        NotificationManager.error('Erro ao salvar!', 'Erro!', 5000);
      }
      this.setState({loadingPage: false});  
    } else {
      NotificationManager.error('Preencha todas as informações antes de salvar!', 'Erro!', 5000);
    }
  };

  handleImage = async () => {
    await this.setState({backGrid: !this.state.backGrid});
    if(this.state.backGrid){
        this.loadImageGrid(1);
    } else {
      this.setState({isImage: false});
    }
  }

  handleDelete = async () => {    
    let shop_id = document.getElementById("selectShop").options[document.getElementById("selectShop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("selectDepto").options[document.getElementById("selectDepto").selectedIndex].getAttribute('id');

    if (shop_id && departament_id) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className='custom-ui'>
              <h1>Confirmação</h1>
              <p>Deseja excluir o plano de fundo?</p>
              <button onClick={onClose}>Não</button>
              <button
                onClick={async () => {                
                  this.setState({loadingPage: true});

                  const response = await api.post('DeleteBackground.php', {
                    "shop_id": shop_id,
                    "departament_id":departament_id
                  });
                  if(response.status === 200){
                    NotificationManager.success('Excluído!', 'Sucesso!', 5000);
                  } else{
                    NotificationManager.error('Erro ao excluir plano de fundo!', 'Erro!', 5000);
                  }
                document.getElementById('background-image').src = "./images/background.jpg";
                document.getElementById('screenPreviewBackground').style.border = "1px dashed black";
                this.setState({loadingPage: false}); 
                  onClose();
                }}
              >
                Sim
              </button>
            </div>
          );
        }
      });
    } else{      
      NotificationManager.error('Preencha todas as informações!', 'Erro!', 5000);
    } 
  }

  // Fim função botões

  handleCloseBackground = () => this.clear();

  handleShowBackground = () => this.setState({ show: true });

  handleChangeShop = () => {
    this.loadDepartament(document.getElementById("selectShop").options[document.getElementById("selectShop").selectedIndex].getAttribute('id'));
  };

  handleChangeDepartament = () => {
    let shop_id = document.getElementById("selectShop").options[document.getElementById("selectShop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("selectDepto").options[document.getElementById("selectDepto").selectedIndex].getAttribute('id');
    this.loadBackground(shop_id, departament_id);
  }

  async onClickCellPhoto() {
    let selectedRows = this.gridApi.getSelectedRows();
    await this.loadScreenImage(selectedRows[0].id);       
    this.setState({imageID:selectedRows[0].id});
  };
  
  async onClickShopAndDepto() {
    let selectedRows = this.gridApi.getSelectedRows();
    let productArray = selectedRows[0];
    document.getElementById("selectShop").options[productArray.shop_id].selected = true;
    await this.loadDepartament(productArray.shop_id);
    document.getElementById("selectDepto").options[productArray.depto_id].selected = true;
    this.loadBackground(productArray.shop_id, productArray.depto_id); 
  };

  render() {
      return (        
        <div style={{display:'none'}}>
          <Modal
            size="lg"
            aria-labelledby="modal-title"
            centered
            id="modal-background"
            show={this.state.show}
            onHide={this.handleCloseBackground}
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title id="modal-background-title">
                Cadastro de plano de fundo
              </Modal.Title>
            </Modal.Header>   
            <Modal.Body>
              <Container>
                <Row>
                  <Col sm={7}>
                    {/* Configurar Tela */}
                    <Form id="formScreen" className="formsConfig">              
                      <Form.Row>
                        <Form.Group>
                          <Form.Label>Loja:</Form.Label>
                          <Form.Control as="select" id="selectShop" onChange={this.handleChangeShop}>
                            <option selected defaultValue="default" disabled={true}>Selecione a loja</option>
                            {this.state.shop.map(shop => (
                              <option id={shop.id} value={shop.id} key={shop.id}>{shop.description}</option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      </Form.Row>
                      <Form.Row>
                          <Form.Group>
                            <Form.Label>Departamento:</Form.Label>
                            <Form.Control as="select" id="selectDepto" onChange={this.handleChangeDepartament}>                            
                              <option selected defaultValue="default" disabled={true}>Selecione o departamento</option>
                              {this.state.departament.map(departament => (
                                <option id={departament.id} value={departament.id} key={departament.id}>{departament.id} - {departament.description}</option>
                              ))}
                            </Form.Control>
                          </Form.Group>
                      </Form.Row>  

                      {/* Botões */}                      
                      <ButtonToolbar className="btns-background">
                            <Button variant="success" onClick={this.handleSave}><FontAwesomeIcon icon={Icon.faSave} />&nbsp;&nbsp;Salvar</Button>
                            <Button variant="danger" onClick={this.handleDelete}><FontAwesomeIcon icon={Icon.faTrashAlt} />&nbsp;&nbsp;Apagar</Button>
                            <Button variant="warning" id="btn-image-upload" onClick={this.handleImage}>{this.state.backGrid ? <FontAwesomeIcon icon={Icon.faUndoAlt} /> 
                                : <FontAwesomeIcon icon={Icon.faFileImage} />}&nbsp;&nbsp;
                                {this.state.backGrid ? "Voltar" : "Mídias"}</Button>
                      </ButtonToolbar>  
                    </Form>
                    <Form id="formAd" className="formsConfig">
                      <Form.Row>                                  
                          {/* Preview da tela */}
                          <div id="screenPreviewBackground">
                            <img src="./images/background.jpg" id="background-image"/>
                          </div>      
                      </Form.Row>            
                    </Form>
                  </Col>
                  <Col sm={5}>
                    <Form id="formSearchProduct" className="formsConfigSearch">   
                      <Form.Row style={{ height: '96%'}}>
                        <Form.Label>{this.state.isImage ? "Imagens ou vídeos cadastrados:" : "Lojas e departamentos:"}</Form.Label>
                        {/* Tabela dos produtos */}
                        <div 
                          className="ag-theme-balham"
                          style={{ 
                          height: '100%', 
                          width: '100%' }} 
                        >
                          <AgGridReact 
                            columnDefs={this.state.isImage ? this.backgroundDatatable.columnDefsImage : this.backgroundDatatable.columnDefs}
                            rowData={this.state.isImage ? this.state.imageGrid : this.state.shopAndDeptoGrid}
                            onGridReady={this.onGridReady}
                            onRowDataUpdated={this.onGridReady}
                            rowSelection={this.backgroundDatatable.rowSelection}
                            onRowDoubleClicked={this.state.isImage ? this.onClickCellPhoto.bind(this) : this.onClickShopAndDepto.bind(this)}
                          >
                          </AgGridReact>
                        </div>
                      </Form.Row>  
                    </Form>
                  </Col>
                </Row>
              </Container>
                <Dimmer active={this.state.loadingPage}>
                  <Loader size='massive' type="Oval" color="#fff" height={80} width={80} visible={this.state.loadingPage}/>
                </Dimmer>
            </Modal.Body>            
          </Modal>
        </div>
      )
    };
}

export default ModalBackground