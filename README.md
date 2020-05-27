> ## DOCUMENT MAPPING - UMG

___________________________________

Este es el proyecto final del curso de ingenieria de software de la Universidad Mariano Gálverz, sede Jalapa. Está basado en infraestructura en la nube como servicio. Utilizando como proveedor AWS, los servicios utilizados son:
* #### AWS lambda
* #### AWS Textract
* #### AWS DynamoDB
* #### AWS Simple Queue Service
* #### AWS RDS for Mysql
* #### AWS S3
* #### AWS CloudFormation
* #### AWS Amazon API Gateway

Todo el cloudformation esta desarollado e implementado usando [Serverless Framework](https://www.serverless.com/), y programado en Javascript [Entorno de ejecución NodeJs]

> _Este es el diagrama de integración de todos los servicios_
![image](https://filesproyectismacm1.s3.us-east-2.amazonaws.com/Proyecto+Final.png)

> ### Los puntos finales de entrada se detallan a continuación:
___
_Para carga del archivo_

    POST - https://zvnx2eevn5.execute-api.us-east-1.amazonaws.com/dev/uploadfile

___
_Para procesamiento del arcihivo en textract_

    POST- https://zvnx2eevn5.execute-api. us-east-1.amazonaws.com/dev/textract
    Conten-Type: application/json

    {
        "name":"namefileins3"
    }
___
_Para encolamiento de auditoria_

    POST - https://zvnx2eevn5.execute-api.us-east-1.amazonaws.com/dev/sqsaudit
    Conten-Type: application/json

    {
        "name":"nameuser",
        "password": "passworduser",
        "action": "actionofuser"
    }

___
_Para generar un reporte completo sobre los archivos procesados en textract_

    GET - https://zvnx2eevn5.execute-api.us-east-1.amazonaws.com/dev/report

___
_Para generar un reporte entre dos fechas_

    POST - https://zvnx2eevn5.execute-api.us-east-1.amazonaws.com/dev/reportdate
    Conten-Type: application/json

    {
	    "date1": "2020-05-20",
	    "date2": "2020-05-23"
    }


## Grupo de desarrollo
* [@Mynor2397](https://github.com/Mynor2397) ⌨️
* [@MasterJB2127](https://github.com/MasterJB2127) ⌨️
* [@bhcc-developer](https://github.com/bhcc-developer)⌨️
