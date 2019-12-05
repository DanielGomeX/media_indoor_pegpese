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


class ModalConfig extends Component {
  

  state = { 
    show: false, 
    displayColorPickerMain: false, 
    displayColorPickerPromote: false,
    shop: [],
    departament: [],
    screen: [],
    screenData: [],
    loadingPage: false,
    colorMain: "",
    colorPromote: "",
    productGrid: [],
    imageGrid: [],
    isImage: false,
    selectedImage: [],
    productGridScreen: [],
    backgroundMidia: [],
    displayGridProduct: "none",
    isAd: false,
    isVideo: false,
    getCount: 0,
    displayVideo: "none",
    children: [],
    imageID: "",
    backGrid: false,
  }

  clear(){
    this.setState({
      show: false, 
      displayColorPickerMain: false, 
      displayColorPickerPromote: false,
      departament: [],
      screen: [],
      screenData: [],
      loadingPage: false,
      colorMain: "",
      colorPromote: "",
      productGrid: [],
      imageGrid: [],
      isImage: false,
      selectedImage: [],
      productGridScreen: [],
      backgroundMidia: [],
      displayGridProduct: "none",
      isAd: false,
      isVideo: false,
      getCount: 0,
      displayVideo: "none",
      children: [],
      imageID: "",
      backGrid: false,
    })
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
              />
            </>
        ]
    })    
  }

  checkMidiaType = (midia_type, screen_midia, shop_id, departament_id, screen_id) => { 
    if(midia_type == 0){        
      this.loadProductGridScreen(shop_id, departament_id, screen_id);      
      this.state.backgroundMidia.map(backgroundMidia => (
        document.getElementById('background-image').src = "data:image/jpeg;base64," + backgroundMidia.midia
      ));
      document.getElementById('side-image').src = "data:image/jpeg;base64," + screen_midia;
      this.setState({displayGridProduct:"block"});      
      this.setState({isAd:false});
      this.setState({isVideo:false});
      this.setState({displayVideo:"none"});
      this.setState({children:[]});     
    }else if (midia_type == 2){      
      this.setState({displayGridProduct:"none"});
      this.setState({isAd:false});
      this.setState({isVideo:true});
      this.setState({displayVideo:"block"});
      document.getElementById('background-image').src = "./images/fundo_transparente.png";
      this.appendChild(screen_midia);   
    } else if (midia_type == 3){      
      document.getElementById('background-image').src = "data:image/jpeg;base64," + screen_midia;
      this.setState({displayGridProduct:"none"});
      this.setState({isAd:true});
      this.setState({isVideo:false});
      this.setState({displayVideo:"none"});
      this.setState({children:[]});
    }
  }

  setDate = () => {
    let now = new Date();
 
    let day = ("0" + now.getDate()).slice(-2);
    let month = ("0" + (now.getMonth() + 1)).slice(-2);

    let today = now.getFullYear()+"-"+(month)+"-"+(day);
    return today;
  }

  componentDidMount(){
    this.loadShop();
  }

  loadShop = async () => {
    const response = await api.post('SelectShop.php', {"application_name": "MIPP"});
    this.setState({shop:response.data});      
  }

  loadDepartament = async (shop_id) => {
    const response = await api.post('SelectDepartament.php', {"shop_id": shop_id});
    this.setState({departament:response.data}); 
  }

  loadScreen = async (shop_id, departament_id) => {
    const response = await api.post('SelectScreen.php', {"shop_id": shop_id, "departament_id": departament_id});
    this.setState({screen:response.data}); 
  }

  loadScreenData = async (shop_id, departament_id, screen_id) => {
    this.setState({loadingPage: true})
    const response = await api.post('SelectLoadMidia.php', {"shop_id": shop_id, "departament_id": departament_id, "screen_id": screen_id});
    this.setState({screenData:response.data}); 
    this.state.screenData.map(screenData => (
      document.getElementById('timer').value = screenData.timer,
      document.getElementById('loop').value = screenData.loop,      
      document.getElementById('inputColor').value = screenData.mainColor,      
      document.getElementById('inputColorPromote').value = screenData.promoteColor,
      document.getElementById('initialDate').value = screenData.initial_date,
      document.getElementById('finalDate').value = screenData.final_date,
      this.checkMidiaType(screenData.midia_type, screenData.midia, shop_id, departament_id, screen_id),
      this.setState({imageID:screenData.midia_id})
    ));
    this.setState({loadingPage: false});
  }

  loadBackground = async (shop_id, departament_id) => {
    const response = await api.post('SelectBackgroundMedia.php', {"shop_id": shop_id, "departament_id": departament_id});
    this.setState({backgroundMidia:response.data}); 
    if(response.data[0].message === "NULL"){      
      NotificationManager.error('Este departamento não possui plano de fundo!', 'Erro!', 5000);
      return;
    };
    this.state.backgroundMidia.map(backgroundMidia => (
      document.getElementById('background-image').src = "data:image/jpeg;base64," + backgroundMidia.midia,
      document.getElementById('screenPreview').style.border = "0",
      this.setState({imageID:backgroundMidia.midia_id})
    ));
  }

  loadScreenImage = async (image_id) => {
    this.setState({loadingPage: true})
    const response = await api.post('SelectMedia.php', {"id": image_id});
    await this.setState({selectedImage:response.data}); 
    this.setState({loadingPage: false});
  }

  loadImageGrid = async (type) => {
    this.setState({loadingPage: true});
    const response = await api.post('SelectImages.php', {"type": type});
    this.setState({imageGrid:response.data});
    this.setState({isImage:true});
    this.setState({loadingPage: false});
  }  
  
  loadProductGrid = async (shop_id, departament_id) => {
    this.setState({loadingPage: true});
    const response = await api.post('SelectProductGrid.php', {"shop_id": shop_id, "departament_id": departament_id});
    this.setState({productGrid:response.data}); 
    this.setState({isImage:false});   
    this.setState({loadingPage: false});
  }

  loadProductGridScreen = async (shop_id, departament_id, screen_id) => {
    this.setState({loadingPage: true});
    const response = await api.post('SelectLoadGrid.php', {"shop_id": shop_id, "departament_id": departament_id, "screen_id":screen_id});
    this.setState({productGridScreen:response.data});    
    this.setState({getCount:this.gridApiPhoto.getDisplayedRowCount()});
    this.setState({loadingPage: false});
  }

  insertProductToPhoto = async (product_id, screen_id, shop_id, departament_id, position) => {
    this.setState({loadingPage: true});
    const response = await api.post('InsertProductScreen.php', {
      "id": product_id,
      "screen_id":screen_id,
      "shop_id": shop_id,
      "departament_id": departament_id,
      "position": position
    });
    if(response.status === 200){
      this.setState({loadingPage: false});
      this.loadProductGridScreen(shop_id, departament_id, screen_id);
    }   
  }

  deleteProductToPhoto = async (product_id, screen_id, shop_id, departament_id, position) => {
    this.setState({loadingPage: true});
    const response = await api.post('DeleteProductScreen.php', {
      "id": product_id,
      "screen_id":screen_id,
      "shop_id": shop_id,
      "departament_id": departament_id,
      "position": position
    });
    if(response.status === 200){
      this.setState({loadingPage: false});
      this.loadProductGridScreen(shop_id, departament_id, screen_id);
    }   
  }

  constructor(props, context){
    super(props, context);
    
    this.handleShowConfig = this.handleShowConfig.bind(this);
    this.handleCloseConfig = this.handleCloseConfig.bind(this);

    this.configDatatable = {
      columnDefs: [{
        headerName: "CODIGO", 
        field: "id",
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains"],
          debounceMs: 0,
          caseSensitive: true,
        },
        width: 120,
      }, 
      {
        headerName: "DESCRIÇÃO",
        field: "description",
        filter: "agTextColumnFilter",
          filterParams: {
            filterOptions: ["contains"],
            textFormatter: function(r) {
              if (r == null) return null;
              r = r.replace(new RegExp("[àáâãäå]", "g"), "a");
              r = r.replace(new RegExp("æ", "g"), "ae");
              r = r.replace(new RegExp("ç", "g"), "c");
              r = r.replace(new RegExp("[èéêë]", "g"), "e");
              r = r.replace(new RegExp("[ìíîï]", "g"), "i");
              r = r.replace(new RegExp("ñ", "g"), "n");
              r = r.replace(new RegExp("[òóôõøö]", "g"), "o");
              r = r.replace(new RegExp("œ", "g"), "oe");
              r = r.replace(new RegExp("[ùúûü]", "g"), "u");
              r = r.replace(new RegExp("[ýÿ]", "g"), "y");
              return r;
            },
            debounceMs: 0,
            caseSensitive: false,
          },
          width: 250,
      },
      {
        headerName: "PREÇO",
        field: "price",
        width: 90,
      },
      {
        headerName: "PREÇO PROMOCIONAL",
        field: "price_promo",
        width: 150,
      }],
      // Imagem
      columnDefsImage: [{
        headerName: "CODIGO", 
        field: "id",
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains"],
          debounceMs: 0,
          caseSensitive: true,
        },
        width: 120,
      }, 
      {
        headerName: "DESCRIÇÃO",
        field: "description",
        filter: "agTextColumnFilter",
          filterParams: {
            filterOptions: ["contains"],
            textFormatter: function(r) {
              if (r == null) return null;
              r = r.replace(new RegExp("[àáâãäå]", "g"), "a");
              r = r.replace(new RegExp("æ", "g"), "ae");
              r = r.replace(new RegExp("ç", "g"), "c");
              r = r.replace(new RegExp("[èéêë]", "g"), "e");
              r = r.replace(new RegExp("[ìíîï]", "g"), "i");
              r = r.replace(new RegExp("ñ", "g"), "n");
              r = r.replace(new RegExp("[òóôõøö]", "g"), "o");
              r = r.replace(new RegExp("œ", "g"), "oe");
              r = r.replace(new RegExp("[ùúûü]", "g"), "u");
              r = r.replace(new RegExp("[ýÿ]", "g"), "y");
              return r;
            },
            debounceMs: 0,
            caseSensitive: false,
          },
          width: 250,
      },
      {
        headerName: "VERSÃO",
        field: "media_version",
        width: 120,
      },
      {
        headerName: "TIPO",
        field: "type",
        width: 120,
      }],
      rowSelection: "single",
    }

    this.configDatatableProduct = {
      columnDefs: [{
        headerName: "POSIÇÃO", 
        field: "position",
        width: 120
        }, 
      {
        headerName: "CODIGO",
        field: "id",
        width: 120
      },
      {
        headerName: "DESCRIÇÃO",
        field: "description",
        width: 200
      },
      {
        headerName: "PREÇO",
        field: "price",
        width: 120
      },
      {
        headerName: "PREÇO PROMOCIONAL",
        field: "price_promo",
        width: 150
      }],
      rowSelection: "single",
    }
  }

  onGridReadyPhoto = params => {
    this.gridApiPhoto = params.api;
    this.gridColumnApiPhoto = params.columnApi;
    this.gridApiPhoto.sizeColumnsToFit();
  };

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  };
  
  // Função botões 

  handleAdd = async () => {    
    if(this.state.screen.length == 10){
      NotificationManager.error('Limite de telas atingido!', 'Erro!', 5000);
    } else {
      let shop_id = document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id');
      let departament_id = document.getElementById("formGridScreen-Departament").options[document.getElementById("formGridScreen-Departament").selectedIndex].getAttribute('id');
  
      this.setState({loadingPage: true});
      
      const response = await api.post('InsertScreen.php', {
        "screen_id": this.state.screen[0].message === "NULL" ? 1 : this.state.screen.length + 1,
        "shop_id": shop_id,
        "departament_id":departament_id
      });

      if(response.status === 200){
        await this.loadScreen(shop_id, departament_id, this.state.screen.length + 1);
        await this.loadScreenData(shop_id, departament_id, this.state.screen.length + 1);
        if(!this.state.isAd && !this.state.isImage){
          this.setState({displayGridProduct:"block"});          
        }; 
        NotificationManager.success('Tela adicionada!', 'Sucesso!', 5000);
      } else{
        NotificationManager.error('Erro ao adicionar tela!', 'Erro!', 5000);
      }
      this.setState({loadingPage: false});   
    }
  };

  handleSave = async () => {       
    let shop_id = document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("formGridScreen-Departament").options[document.getElementById("formGridScreen-Departament").selectedIndex].getAttribute('id');
    let screen_id = document.getElementById("formGridScreen-Screen").options[document.getElementById("formGridScreen-Screen").selectedIndex].getAttribute('id');
    let normal_product_color = document.getElementById("inputColor").value.replace('#', '');
    let promotional_product_color = document.getElementById("inputColorPromote").value.replace('#', '');
    let timer = document.getElementById("timer").value;
    let loop = document.getElementById("loop").value;
    let initial_date = document.getElementById("initialDate").value;
    let final_date = document.getElementById("finalDate").value;
    let midia_id = this.state.imageID;

    if(shop_id && departament_id && screen_id && normal_product_color && promotional_product_color && timer && loop && midia_id){
      this.setState({loadingPage: true});
      const response = await api.post('UpdateScreen.php', {
        "screen_id": screen_id,
        "shop_id": shop_id,
        "departament_id":departament_id,
        "timer": timer,
        "midia_id":midia_id,
        "normal_product_color": normal_product_color,
        "promotional_product_color": promotional_product_color,
        "loop": loop,
        "initial_date": initial_date,
        "final_date": final_date
      });
      if(response.status === 200){
        this.loadScreenData(shop_id, departament_id, screen_id);
        NotificationManager.success('Salvo!', 'Sucesso!', 5000);
      } else{
        NotificationManager.error('Erro na atualização!', 'Erro!', 5000);
      }
      this.setState({loadingPage: false}); 
    } else{
      NotificationManager.error('Preencha todas as informações antes de salvar!', 'Erro!', 5000);
    }
  };

  handleImage = async () => {
    await this.setState({backGrid: !this.state.backGrid});
    if(this.state.backGrid){
      if(this.state.isAd){  
        this.loadImageGrid(3);
      } else if(this.state.isVideo){
        this.loadImageGrid(2);
      } else { 
        this.loadImageGrid(0);
      }
    } else {
      this.setState({isImage: false});
    }
  }

  handleDelete = async () => {
    let shop_id = document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("formGridScreen-Departament").options[document.getElementById("formGridScreen-Departament").selectedIndex].getAttribute('id');
    let screen_id = document.getElementById("formGridScreen-Screen").options[document.getElementById("formGridScreen-Screen").selectedIndex].getAttribute('id');
    
    if(shop_id && departament_id && screen_id){
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className='custom-ui'>
              <h1>Confirmação</h1>
              <p>Deseja excluir a tela?</p>
              <button onClick={onClose}>Não</button>
              <button
                onClick={async () => {
                  this.setState({loadingPage: true});
                
                  const response = await api.post('DeleteScreen.php', {
                    "screen_id": screen_id,
                    "shop_id": shop_id,
                    "departament_id":departament_id
                  });
                  if(response.status === 200){
                    this.handleChangeDepartament();
                    NotificationManager.success('Excluído!', 'Sucesso!', 5000);
                  } else{                    
                    NotificationManager.error('Erro ao excluir tela!', 'Erro!', 5000);
                  }
                  document.getElementById('background-image').src = "./images/background.jpg";
                  document.getElementById('screenPreview').style.border = "1px dashed black";   
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
      NotificationManager.error('Preencha todas as informações!', 'Erro!', 5000);
    }
    
  }

  // Fim função botões

  handleCloseConfig = () => this.clear();

  handleShowConfig = () => this.setState({ show: true });

  handleChangeShop = () => {
    this.loadDepartament(document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id'));
  };

  handleChangeDepartament = () => {
    let shop_id = document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("formGridScreen-Departament").options[document.getElementById("formGridScreen-Departament").selectedIndex].getAttribute('id');
    this.loadProductGrid(shop_id,departament_id);
    this.loadScreen(shop_id, departament_id);
    this.loadBackground(shop_id, departament_id);
    document.getElementById('timer').value = '';
    document.getElementById('loop').value = '';
    document.getElementById('initialDate').value = '';
    document.getElementById('finalDate').value = '';
  }

  handleChangeScreen = () => {
    let shop_id = document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("formGridScreen-Departament").options[document.getElementById("formGridScreen-Departament").selectedIndex].getAttribute('id');
    let screen_id = document.getElementById("formGridScreen-Screen").options[document.getElementById("formGridScreen-Screen").selectedIndex].getAttribute('id');
    this.loadScreenData(shop_id, departament_id, screen_id);
  };

  handleClickColorPickerMain = () => {
    this.setState({ displayColorPickerMain: !this.state.displayColorPickerMain })
  };

  handleCloseColorPickerMain = () => {
    this.setState({ displayColorPickerMain: false })
  };

  handleClickColorPickerPromote = () => {
    this.setState({ displayColorPickerPromote: !this.state.displayColorPickerPromote })
  };

  handleCloseColorPickerPromote = () => {
    this.setState({ displayColorPickerPromote: false })
  };

  handleChangeColorMain = (color) => {
    document.getElementById('inputColor').value = color.hex;
    document.getElementById('colorPreview').style.backgroundColor = color.hex;
  };

  handleChangeColorPromote = (color) => {
    document.getElementById('inputColorPromote').value = color.hex;
    document.getElementById("colorPreviewPromote").style.backgroundColor = color.hex;
  };

  handleCheckbox = () => {
    let shop_id = document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("formGridScreen-Departament").options[document.getElementById("formGridScreen-Departament").selectedIndex].getAttribute('id');
    if(!this.state.isImage){
      this.loadBackground(shop_id, departament_id);
    }
  }

  async onClickCellPhoto() {
    let shop_id = document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("formGridScreen-Departament").options[document.getElementById("formGridScreen-Departament").selectedIndex].getAttribute('id');
    let screen_id = document.getElementById("formGridScreen-Screen").options[document.getElementById("formGridScreen-Screen").selectedIndex].getAttribute('id');
    let selectedRows = this.gridApi.getSelectedRows();
    await this.loadScreenImage(selectedRows[0].id);       
    await this.setState({imageID:selectedRows[0].id})
    this.checkMidiaType(selectedRows[0].type, this.state.selectedImage[0].midia, shop_id, departament_id, screen_id);
  };

  onClickProduct() {
    let shop_id = document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("formGridScreen-Departament").options[document.getElementById("formGridScreen-Departament").selectedIndex].getAttribute('id');
    let screen_id = document.getElementById("formGridScreen-Screen").options[document.getElementById("formGridScreen-Screen").selectedIndex].getAttribute('id');
    let selectedRows = this.gridApi.getSelectedRows();
    let productArray = selectedRows[0];
    this.insertProductToPhoto(productArray.id, screen_id, shop_id, departament_id, this.state.getCount + 1);
  };

  onClickProductScreen() {   
    let shop_id = document.getElementById("formGridScreen-Shop").options[document.getElementById("formGridScreen-Shop").selectedIndex].getAttribute('id');
    let departament_id = document.getElementById("formGridScreen-Departament").options[document.getElementById("formGridScreen-Departament").selectedIndex].getAttribute('id');
    let screen_id = document.getElementById("formGridScreen-Screen").options[document.getElementById("formGridScreen-Screen").selectedIndex].getAttribute('id'); 
    let selectedRows = this.gridApiPhoto.getSelectedRows();
    let productArray = selectedRows[0];
    this.deleteProductToPhoto(productArray.id, screen_id, shop_id, departament_id, productArray.position);
  };


  render() {
      const popover = {
        position: 'absolute',
        zIndex: '2',
      }

      const cover = {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      }

      return (   
        <div style={{display:'none'}}>
          <Modal
            size="lg"
            aria-labelledby="modal-title"
            centered
            id="modal-config"
            show={this.state.show}
            onHide={this.handleCloseConfig}
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title id="modal-config-title">
                Configurações de tela
              </Modal.Title>
            </Modal.Header>   
            <Modal.Body>
              <Container>
                <Row>
                  <Col sm={7}>
                    {/* Configurar Tela */}
                    <Form id="formScreen" className="formsConfig">              
                      <Form.Row>
                        <Form.Group as={Col}>
                          <Form.Label>Loja:</Form.Label>
                          <Form.Control as="select" id="formGridScreen-Shop" onChange={this.handleChangeShop}>
                            <option selected defaultValue="default" disabled={true}>Selecione a loja</option>
                            {this.state.shop.map(shop => (
                              <option id={shop.id} key={shop.id}>{shop.description}</option>
                            ))}
                          </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col}>
                          <Form.Label>Departamento:</Form.Label>
                          <Form.Control as="select" id="formGridScreen-Departament" onChange={this.handleChangeDepartament}>                            
                            <option selected defaultValue="default" disabled={true}>Selecione o departamento</option>
                            {this.state.departament.map(departament => (
                              <option id={departament.id} key={departament.id}>{departament.id} - {departament.description}</option>
                            ))}
                          </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col}>
                          <Form.Label>Tela:</Form.Label>
                          <Form.Control as="select" id="formGridScreen-Screen" onChange={this.handleChangeScreen}>
                            <option selected defaultValue="default" disabled={true}>Selecione a tela</option>
                            {this.state.screen.map(screen => (
                              <option id={screen.id} key={screen.id}>{screen.id}</option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      </Form.Row>            
            
                    </Form>
                    <Container>
                      <Row> 
                        {/* Configurar Tempo */}
                        <Col>                       
                            <Form id="formTime" className="formsConfig">   
                              <Form.Row>
                                  <Form.Group as={Col}>
                                    <Form.Label>Timer (segundos):</Form.Label>
                                    <Form.Control type="number" placeholder="ex.: 10"
                                      aria-label="Timer"
                                      id="timer">
                                    </Form.Control>
                                  </Form.Group>
                              </Form.Row>
                            
                              <Form.Row>
                                <Form.Group as={Col}>
                                  <Form.Label>Loop:</Form.Label>
                                  <Form.Control type="number" placeholder="ex.: 15"
                                    aria-label="Loop"
                                    id="loop">
                                  </Form.Control>
                                </Form.Group>
                              </Form.Row>       
                            </Form>
                        </Col>
                        {/* Configurar Cores */}
                        <Col>                                            
                          <Form id="formColor" className="formsConfig">   
                              <Form.Row>
                                <Form.Group as={Col}>
                                  <Form.Label>Cor da lista principal:</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Prepend>
                                      <InputGroup.Text id="addonHash">#</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control
                                      aria-describedby="addonHash"
                                      id="inputColor"
                                      onClick={ this.handleClickColorPickerMain }
                                      defaultValue="#000000"
                                    />
                                  </InputGroup>                                                                      
                                  { this.state.displayColorPickerMain ? <div style={ popover }>
                                  <div style={ cover } onClick={ this.handleCloseColorPickerMain }/>
                                  <SketchPicker onChangeComplete={ this.handleChangeColorMain } />
                                  </div> : null }
                                  <div className="colorPreview" id="colorPreview"></div>
                                </Form.Group>
                              </Form.Row>
                            
                              <Form.Row>
                                <Form.Group as={Col}>
                                  <Form.Label>Cor da lista promocional:</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Prepend>
                                      <InputGroup.Text id="addonHash">#</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control
                                      aria-describedby="addonHash"
                                      id="inputColorPromote"
                                      onClick={ this.handleClickColorPickerPromote }
                                      defaultValue="#ff0000"
                                    />
                                  </InputGroup>                                                                      
                                  { this.state.displayColorPickerPromote ? <div style={ popover }>
                                  <div style={ cover } onClick={ this.handleCloseColorPickerPromote }/>
                                  <SketchPicker onChangeComplete={ this.handleChangeColorPromote } />
                                  </div> : null }
                                  <div className="colorPreview" id="colorPreviewPromote"></div>
                                </Form.Group>
                              </Form.Row>       
                            </Form>
                          </Col>
                        </Row>
                      </Container>
                      {/* Configurar anúncio ou vídeo */}
                      <Form id="formAd" className="formsConfig">
                        <Form.Row>
                          <Container>
                            <Row>
                              {/* Vídeo */}
                              <Col>                                
                                <Form.Check
                                  custom
                                  label="Definir como tela de vídeo"
                                  type='checkbox'
                                  id='videoCheckbox'
                                  name='checkboxesType'
                                  className='checkboxes'
                                  checked={this.state.isVideo}
                                  onClick={this.handleCheckbox}
                                  onChange={async (e) => {
                                    let x = e.target.checked;
                                    await this.setState({ isVideo: !this.state.isVideo, isAd: false });
                                    if(this.state.isAd) {
                                      this.setState({displayGridProduct:"none"});
                                    } else if(this.state.isVideo){
                                      this.setState({displayGridProduct:"none"});
                                    }else{                                      
                                      this.setState({displayGridProduct:"block"});
                                      this.setState({displayVideo:"none"});
                                      this.setState({children:[]});
                                    } 
                                  }}
                                />
                                <Form.Label>Data inicial:</Form.Label>
                                <Form.Control type="date"
                                  aria-label="Date"
                                  defaultValue={this.setDate()}
                                  id="initialDate">
                                </Form.Control>
                              </Col>
                              {/* Anúncio */}
                              <Col>                                
                                <Form.Check
                                      custom
                                      label="Definir como tela de anúncio"
                                      type='checkbox'
                                      id='adCheckbox'
                                      name='checkboxesType'
                                      className='checkboxes'
                                      checked={this.state.isAd}
                                      onClick={this.handleCheckbox}
                                      onChange={async (e) => {
                                        let x = e.target.checked;
                                        await this.setState({ isVideo: false, isAd: !this.state.isAd });
                                        if(this.state.isAd) {
                                          this.setState({displayGridProduct:"none"});
                                        } else if(this.state.isVideo){
                                          this.setState({displayGridProduct:"none"});
                                        }else{                                      
                                          this.setState({displayGridProduct:"block"});
                                          this.setState({displayVideo:"none"});
                                          this.setState({children:[]});
                                        } 
                                      }}
                                />
                                <Form.Label>Data Final:</Form.Label>
                                <Form.Control type="date"
                                  aria-label="Date"
                                  id="finalDate">
                                </Form.Control>
                              </Col>
                            </Row>
                          </Container>                            
                        </Form.Row>
                      </Form>
                      <Form id="formAd" className="formsConfig">
                        <Form.Row>                                  
                            {/* Preview da tela */}
                            <div id="screenPreview">
                                {this.state.children.map(child => child)}
                              <img src="./images/background.jpg" id="background-image"/>
                              <img src="./images/fundo_transparente.png" id="side-image" style={{display: this.state.displayGridProduct}}/>
                              {/* Tabela dos produtos */}
                              <div 
                                className="ag-theme-balham"
                                id="gridProductPhoto"
                                style={{display:this.state.displayGridProduct}}>
                                <AgGridReact
                                  columnDefs={this.configDatatableProduct.columnDefs}
                                  rowData={this.state.productGridScreen}
                                  onGridReady={this.onGridReadyPhoto}
                                  rowSelection={this.configDatatable.rowSelection}
                                  onRowDoubleClicked={this.onClickProductScreen.bind(this)}
                                >
                                </AgGridReact>
                              </div>
                            </div>
                            {/* Botões */}
                            <Form.Group as={Col} controlId="formGridScreen-Btn">
                                <ButtonToolbar className="btns-config">
                                  <Button variant="info" onClick={this.handleAdd}><FontAwesomeIcon icon={Icon.faPlus} />&nbsp;&nbsp;Adicionar</Button>
                                  <Button variant="success" onClick={this.handleSave}><FontAwesomeIcon icon={Icon.faSave} />&nbsp;&nbsp;Salvar</Button>
                                  <Button variant="danger" onClick={this.handleDelete}><FontAwesomeIcon icon={Icon.faTrashAlt} />&nbsp;&nbsp;Apagar</Button>
                                  <Button variant="warning" id="btn-image-upload" onClick={this.handleImage}>{this.state.backGrid ? <FontAwesomeIcon icon={Icon.faBoxes} /> 
                                  : <FontAwesomeIcon icon={Icon.faFileImage} />}&nbsp;&nbsp;
                                  {this.state.backGrid ? "Produtos" : "Mídias"}</Button>
                                </ButtonToolbar> 
                            </Form.Group>        
                        </Form.Row>            
                      </Form>
                  </Col>

                  {/* Procurar produto */}
                  <Col sm={5}>
                    <Form id="formSearchProduct" className="formsConfigSearch">   
                      <Form.Row style={{ height: '96%'}}>
                        <Form.Label>{this.state.isImage ? "Imagens ou vídeos cadastrados:" : "Produtos do departamento:"}</Form.Label>
                        {/* Tabela dos produtos */}
                        <div 
                          className="ag-theme-balham"
                          style={{ 
                          height: '100%', 
                          width: '100%' }} 
                        >
                          <AgGridReact
                            columnDefs={this.state.isImage ? this.configDatatable.columnDefsImage : this.configDatatable.columnDefs}
                            rowData={this.state.isImage ? this.state.imageGrid : this.state.productGrid}
                            onGridReady={this.onGridReady}
                            floatingFilter={true}
                            rowSelection={this.configDatatable.rowSelection}
                            onRowDoubleClicked={this.state.isImage ? this.onClickCellPhoto.bind(this) : this.onClickProduct.bind(this)}
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

export default ModalConfig