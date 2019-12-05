import React, { Component } from 'react';
import {
  Modal,
  Button,
  Form,
  Col,
  Row,
  ButtonToolbar,
  Container
} from 'react-bootstrap';
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


class ModalMedia extends Component {
  
  state = { 
    show: false, 
    imageGrid: [],
    loadingPage: false,
    backgroundMidia: [],
    selectedImage: [],
    imageID: "",
    isImage: false,
    isVideo: false,
    displayVideo: "none",
    children: [],
    type: '',
  }

  appendChild = (video) => {   
    this.setState({
        children: [
          <>
            <ReactPlayer
            url={[
              {src: 'data:video/mp4;base64,' + video, type: 'video/mp4'}
              ]}
              playing
              width= "100%"
              height= "100%"
              style={{position: "absolute", zIndex: "999", display:this.state.displayVideo}}
              id="video_ad"
              />
            </>
        ]
    })    
  }

  componentDidMount(){
    this.loadGrid();
  }

  clear(){
    this.setState({
      show: false,  
      loadingPage: false,
      backgroundMidia: [],
      selectedImage: [],
      imageID: "",
      isImage: false,
      isVideo: false,
      displayVideo: "none",
      children: [],
    });
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
    const response = await api.post('SelectMediaInfo.php', {"application_name": "MIPP"});
    await this.setState({imageGrid:response.data}); 
    this.setState({loadingPage: false});
  }

  loadScreenImage = async (image_id, type) => {
    this.setState({loadingPage: true})
    const response = await api.post('SelectMedia.php', {"id": image_id});
    await this.setState({selectedImage:response.data});
    
    if(type == 2){
      this.setState({isVideo:true});
      this.setState({displayVideo:"block"});
      document.getElementById('background-image').src = "./images/fundo_transparente.png";
      document.getElementById('side-image').src = "./images/fundo_transparente.png";
      this.appendChild(response.data[0].midia);
    } else if(type == 0){ 
      this.setState({isVideo:false});
      this.setState({displayVideo:"none"});
      this.setState({children:[]}) 
      this.state.selectedImage.map(image => (
        document.getElementById('background-image').src = "./images/fundo_transparente.png", 
        document.getElementById('side-image').src = "data:image/jpeg;base64," + image.midia,
        this.setState({imageID:image.midia_id})
      ));
    } else{
      this.setState({isVideo:false});
      this.setState({displayVideo:"none"});
      this.setState({children:[]})
      this.state.selectedImage.map(image => (
        document.getElementById('background-image').src = "data:image/jpeg;base64," + image.midia,
        document.getElementById('side-image').src = "./images/fundo_transparente.png",
        this.setState({imageID:image.midia_id})
      ));
  }
    document.getElementById('screenPreviewBackground').style.border = "0";
    this.setState({loadingPage: false});
  }

  onChangeRadioBtn = async (el) => {
    this.setState({changeGrid: true});
    if(el.target.id === "imageRadioBtn"){
      this.setState({loadingPage: true});
      this.setState({type: '0'});
      this.setState({loadingPage: false});
    } else if(el.target.id === "videoRadioBtn"){
      this.setState({loadingPage: true});
      this.setState({type: '2'});
      this.setState({loadingPage: false})
    } else if(el.target.id === "photoRadioBtn"){
      this.setState({loadingPage: true});
      this.setState({type: '3'});
      this.setState({loadingPage: false})      
    } else if(el.target.id === "backgroundRadioBtn"){
      this.setState({loadingPage: true});
      this.setState({type: '1'});
      this.setState({loadingPage: false})      
    }
  };

  constructor(props, context){
    super(props, context);
    
    this.handleShowMedia = this.handleShowMedia.bind(this);
    this.handleCloseMedia = this.handleCloseMedia.bind(this);

    this.mediaDatatable = {
      // Imagem
      columnDefsImage: [{
        headerName: "CÓDIGO", 
        field: "id",
      }, 
      {
        headerName: "DESCRIÇÃO",
        field: "description",
      },
      {
        headerName: "TIPO",
        field: "type",
      },
      {
        headerName: "VERSÃO",
        field: "media_version",
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
    if(this.state.type != ''){
      let description = document.getElementById('descriptionInput').value;
      if(description){
        let image = document.getElementById('background-image').src.split(',')[1];
        let imageSide = document.getElementById('side-image').src.split(',')[1];
        let video = undefined;
        let finalMedia;
        if(this.state.isVideo){
          video = await document.getElementById('video_ad').childNodes[0].currentSrc;
          video = video.split(',')[1];
        }        
        if(image){
          finalMedia = await image;
        } else if(imageSide){
          finalMedia = await imageSide;
        } else{
          finalMedia = await video;
        }
        if(image || imageSide || video){
          this.setState({loadingPage: true});
          const response = await api.post('InsertMedia.php', {
            "description": description,
            "type": this.state.type,
            "image": finalMedia,
          });
          if(response.status === 200){
            NotificationManager.success('Salvo!', 'Sucesso!', 5000);
            this.loadGrid();
          } else{
            NotificationManager.error('Erro ao adicionar mídia!', 'Erro!', 5000);
          }
          this.setState({loadingPage: false}); 
        } else{          
          NotificationManager.error('Impossível salvar sem uma mídia selecionada!', 'Erro!', 5000);
        }
      } else{
        NotificationManager.error('Adicione um descrição para a mídia!', 'Erro!', 5000);
      }  
    } else{
      NotificationManager.error('Selecione um tipo de mídia!', 'Erro!', 5000);
    }
    
  };

  handleImageUpload = () => document.getElementById("inputFile").click();

  handleUpload = async (e) => {
    let radiosBtn = document.getElementsByName('radiosBtn');
    this.setState({loadingPage: true});
    for(let i=0; i < radiosBtn.length; i++){
      if(radiosBtn[i].checked){
        const file = e.target.files[0];
        const fileReader = new FileReader();
        if(radiosBtn[i].id === "imageRadioBtn"){
          fileReader.onloadend = () => {
            this.setState({isVideo:false});
            this.setState({displayVideo:"none"});
            this.setState({children:[]});
            document.getElementById('background-image').src = "./images/fundo_transparente.png";
            document.getElementById('side-image').src = fileReader.result;
          }          
        } else if(radiosBtn[i].id === "videoRadioBtn") {
          fileReader.onloadend = () => {
            this.setState({isVideo:true});
            this.setState({displayVideo:"block"});
            document.getElementById('background-image').src = "./images/fundo_transparente.png";
            document.getElementById('side-image').src = "./images/fundo_transparente.png";
            this.appendChild(fileReader.result.split(',')[1]);
          }          
        } else{
          fileReader.onloadend = () => {
            this.setState({isVideo:false});
            this.setState({displayVideo:"none"});
            this.setState({children:[]});
            document.getElementById('background-image').src = fileReader.result;
            document.getElementById('side-image').src = "./images/fundo_transparente.png";
          }          
        }
        fileReader.readAsDataURL(file);
        this.setState({loadingPage: false});
        return;
      };
    }    
    this.setState({loadingPage: false});
    NotificationManager.error('Selecione um tipo de mídia!', 'Erro!', 5000);
  }

  handleDelete = async () => {
    if(this.state.imageID){      
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className='custom-ui'>
              <h1>Confirmação</h1>
              <p>Deseja excluir a mídia?</p>
              <button onClick={onClose}>Não</button>
              <button
                onClick={async () => {
                  this.setState({loadingPage: true});

                  const response = await api.post('DeleteMedia.php', {
                    "id": this.state.imageID
                  });
                  
                  if(response.status === 200){
                    this.setState({selectedImage: []})        
                    this.loadGrid();
                    document.getElementById('descriptionInput').value = '';
                    NotificationManager.success('Excluído!', 'Sucesso!', 5000);
                  } else{
                    NotificationManager.error('Erro ao excluir mídia!', 'Erro!', 5000);
                  }
                  document.getElementById('background-image').src = "./images/background.jpg";
                  document.getElementById('side-image').src = "./images/fundo_transparente.png";                  
                  this.setState({isVideo:false});
                  this.setState({displayVideo:"none"});
                  this.setState({children:[]});
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
    } else {
      NotificationManager.error('Impossível excluir sem selecionar nenhuma mídia!', 'Erro!', 5000);
    } 
  }

  // Fim função botões

  handleCloseMedia = () => this.clear();

  handleShowMedia = () => this.setState({ show: true });

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
    await this.loadScreenImage(selectedRows[0].id, selectedRows[0].type);

    if(selectedRows[0].type === "0"){
      document.getElementById("imageRadioBtn").checked = true;
      this.setState({type: '0'});
    } else if(selectedRows[0].type === "1") {
      document.getElementById("backgroundRadioBtn").checked = true;
      this.setState({type: '1'});
    } else if(selectedRows[0].type === "2") {
      document.getElementById("videoRadioBtn").checked = true;
      this.setState({type: '2'});
    } else if(selectedRows[0].type === "3"){
      document.getElementById("photoRadioBtn").checked = true;
      this.setState({type: '3'});
    }

    document.getElementById('descriptionInput').value = selectedRows[0].description;
    this.setState({imageID:selectedRows[0].id});
  };

  render() {
      return (        
        <div style={{display:'none'}}>
          <Modal
            size="lg"
            aria-labelledby="modal-title"
            centered
            id="modal-media"
            show={this.state.show}
            onHide={this.handleCloseMedia}
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title id="modal-media-title">
                Cadastro de mídia
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
                          <Form.Check
                            inline
                            type="radio"
                            label="Imagem"
                            name="radiosBtn"
                            id="imageRadioBtn"
                            className="radiosBtn"
                            onChange={this.onChangeRadioBtn}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            label="Vídeo"
                            name="radiosBtn"
                            id="videoRadioBtn"
                            className="radiosBtn"
                            style={{'marginLeft': '55px'}}
                            onChange={this.onChangeRadioBtn}
                          />
                        </Form.Group>
                      </Form.Row>
                      <Form.Row>
                          <Form.Group>   
                            <Form.Check
                              inline
                              type="radio"
                              label="Foto de anúncio"
                              name="radiosBtn"
                              id="photoRadioBtn"
                              className="radiosBtn"
                              onChange={this.onChangeRadioBtn}
                            />
                            <Form.Check
                              inline
                              type="radio"
                              label="Plano de fundo"
                              name="radiosBtn"
                              id="backgroundRadioBtn"
                              className="radiosBtn"
                              onChange={this.onChangeRadioBtn}
                            />
                          </Form.Group>
                      </Form.Row>  
                      <Form.Row>
                          <Form.Group style={{'width': '50%'}}>  
                            <Form.Label>Descrição:</Form.Label>
                            <Form.Control type="text" id="descriptionInput"/>
                            <Form.Text className="text-muted">
                              Descrição para inserção da mídia.
                            </Form.Text>                           
                          </Form.Group>
                      </Form.Row>  

                      {/* Botões */}  
                      <ButtonToolbar className="btns-media">
                            <Button variant="success" onClick={this.handleSave}><FontAwesomeIcon icon={Icon.faSave} />&nbsp;&nbsp;Salvar</Button>
                            <Button variant="danger" onClick={this.handleDelete}><FontAwesomeIcon icon={Icon.faTrashAlt} />&nbsp;&nbsp;Apagar</Button>
                            <Button variant="warning" id="btn-image-upload" onClick={this.handleImageUpload}><FontAwesomeIcon icon={Icon.faUpload} />&nbsp;&nbsp; Upload</Button>
                            <input type="file" name="inputFile" id="inputFile" onChange={this.handleUpload} accept="image/jpeg,video/mp4" /> 
                      </ButtonToolbar> 
                    </Form>
                    <Form id="formAd" className="formsConfig">
                      <Form.Row>                                  
                          {/* Preview da tela */}
                          <div id="screenPreviewBackground">                          
                              {this.state.children.map(child => child)}
                              <img src="./images/background.jpg" id="background-image"/>
                              <img src="./images/fundo_transparente.png" id="side-image" style={{display: this.state.displayGridProduct}}/>
                          </div>      
                      </Form.Row>            
                    </Form>
                  </Col>
                  <Col sm={5}>
                    <Form id="formSearchProduct" className="formsConfigSearch">   
                      <Form.Row style={{ height: '96%'}}>
                        <Form.Label>Imagens ou vídeos cadastrados:</Form.Label>
                        {/* Tabela dos produtos */}
                        <div 
                          className="ag-theme-balham"
                          style={{ 
                          height: '100%', 
                          width: '100%' }} 
                        >
                          <AgGridReact 
                            columnDefs={this.mediaDatatable.columnDefsImage}
                            rowData={this.state.imageGrid}
                            onGridReady={this.onGridReady}
                            onRowDataUpdated={this.onGridReady}
                            rowSelection={this.mediaDatatable.rowSelection}
                            onRowDoubleClicked={this.onClickCellPhoto.bind(this)}
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

export default ModalMedia